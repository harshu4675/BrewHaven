const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Settings = require("../models/Settings");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { protect } = require("../middleware/auth");
const { admin } = require("../middleware/admin");
const razorpay = require("../config/razorpay");
const Coupon = require("../models/Coupon");

// Helper function to create notification
const createNotification = async (
  userId,
  type,
  title,
  message,
  orderId = null,
) => {
  try {
    await Notification.create({
      user: userId,
      type,
      title,
      message,
      orderId,
    });
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};

// Helper function to notify all admins
const notifyAdmins = async (type, title, message, orderId = null) => {
  try {
    const admins = await User.find({ role: "admin" });
    const notifications = admins.map((admin) => ({
      user: admin._id,
      type,
      title,
      message,
      orderId,
    }));
    await Notification.insertMany(notifications);
  } catch (error) {
    console.error("Error notifying admins:", error);
  }
};

// Get shop status
// ✅ Specific route - must be before /:id
router.get("/shop-status", async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }

    const isOpen = settings.isShopOpen();

    res.json({
      isOpen,
      manualOverride: !settings.autoOpenClose,
      cafeOpen: settings.cafeOpen,
      openTime: settings.openTime,
      closeTime: settings.closeTime,
      orderType: settings.orderType,
      pickupMessage: settings.pickupMessage,
      closedMessage: settings.closedMessage,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user orders
// ✅ Specific route - must be before /:id
router.get("/my-orders", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.product", "name image")
      .sort("-createdAt");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get order stats (admin)
// ✅ MOVED UP - must be before /:id to prevent "stats" being treated as ID
router.get("/stats/summary", protect, admin, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({
      orderStatus: "pending",
    });
    const preparingOrders = await Order.countDocuments({
      orderStatus: "preparing",
    });
    const readyOrders = await Order.countDocuments({ orderStatus: "ready" });
    const deliveredOrders = await Order.countDocuments({
      orderStatus: "delivered",
    });

    const revenue = await Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);

    // Today's orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: today },
    });

    const todayRevenue = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          createdAt: { $gte: today },
        },
      },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);

    res.json({
      totalOrders,
      pendingOrders,
      preparingOrders,
      readyOrders,
      deliveredOrders,
      totalRevenue: revenue[0]?.total || 0,
      todayOrders,
      todayRevenue: todayRevenue[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all orders (admin)
router.get("/", protect, admin, async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};

    if (status && status !== "all") {
      query.orderStatus = status;
    }

    const orders = await Order.find(query)
      .populate("user", "name email phone")
      .populate("items.product", "name image")
      .sort("-createdAt");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single order
// ✅ MUST BE AFTER all specific routes like /my-orders, /shop-status, /stats/summary
router.get("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email phone")
      .populate("items.product", "name image price");

    if (order) {
      if (
        req.user.role !== "admin" &&
        order.user._id.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({ message: "Not authorized" });
      }
      res.json(order);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create Razorpay order
router.post("/create-razorpay-order", protect, async (req, res) => {
  try {
    // Check if shop is open
    const settings = await Settings.findOne();
    if (settings && !settings.isShopOpen()) {
      return res.status(400).json({
        message: settings.closedMessage || "Sorry, we are currently closed.",
        shopClosed: true,
      });
    }

    const { amount } = req.body;

    const options = {
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `order_${Date.now()}`,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    res.status(500).json({ message: "Failed to create payment order" });
  }
});

// Verify Razorpay payment
router.post("/verify-payment", protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      res.json({
        verified: true,
        paymentId: razorpay_payment_id,
      });
    } else {
      res.status(400).json({
        verified: false,
        message: "Invalid payment signature",
      });
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({ message: "Payment verification failed" });
  }
});

// Create order after successful payment
router.post("/", protect, async (req, res) => {
  try {
    const settings = await Settings.findOne();
    if (settings && !settings.isShopOpen()) {
      return res.status(400).json({
        message:
          settings.closedMessage || "Sorry, the café is currently closed.",
        shopClosed: true,
      });
    }

    const {
      items,
      shippingAddress,
      paymentId,
      razorpayOrderId,
      subtotal,
      tax,
      total,
      discount,
      couponCode,
      notes,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    if (!paymentId) {
      return res.status(400).json({ message: "Payment verification required" });
    }

    // Update stock
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (product) {
        if (product.stock < item.quantity) {
          return res.status(400).json({
            message: `${product.name} is out of stock`,
          });
        }
        product.stock -= item.quantity;
        await product.save();
      }
    }

    // Mark coupon as used if applied
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (coupon) {
        coupon.usedCount += 1;
        coupon.usedBy.push({
          user: req.user._id,
          usedAt: new Date(),
        });
        await coupon.save();
      }
    }

    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress,
      paymentId,
      razorpayOrderId,
      paymentStatus: "paid",
      paymentMethod: "razorpay",
      orderType: settings?.orderType || "pickup",
      subtotal,
      discount: discount || 0,
      couponCode: couponCode || null,
      tax,
      total,
      notes,
      orderStatus: "confirmed",
    });

    const populatedOrder = await Order.findById(order._id)
      .populate("user", "name email")
      .populate("items.product", "name image");

    // Create notification for user
    await createNotification(
      req.user._id,
      "order_placed",
      "🎉 Order Placed Successfully!",
      `Your order #${order._id.toString().slice(-8).toUpperCase()} has been placed. Total: ₹${total.toFixed(2)}. Please wait for confirmation.`,
      order._id,
    );

    // Notify all admins about new order
    await notifyAdmins(
      "new_order",
      "🆕 New Order Received!",
      `New order #${order._id.toString().slice(-8).toUpperCase()} from ${req.user.name}. Total: ₹${total.toFixed(2)}`,
      order._id,
    );

    res.status(201).json({
      ...populatedOrder.toObject(),
      pickupMessage:
        settings?.pickupMessage ||
        "Please pick up your order from the counter.",
    });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Update order status (admin)
router.put("/:id/status", protect, admin, async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email phone",
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const previousStatus = order.orderStatus;
    order.orderStatus = orderStatus;
    await order.save();

    // Create notification for user based on status change
    const orderNumber = order._id.toString().slice(-8).toUpperCase();
    let notificationData = null;

    switch (orderStatus) {
      case "confirmed":
        notificationData = {
          type: "order_confirmed",
          title: "✅ Order Confirmed!",
          message: `Your order #${orderNumber} has been confirmed and will be prepared soon.`,
        };
        break;
      case "preparing":
        notificationData = {
          type: "order_preparing",
          title: "👨‍🍳 Preparing Your Order!",
          message: `Your order #${orderNumber} is being prepared. We'll notify you when it's ready!`,
        };
        break;
      case "ready":
        notificationData = {
          type: "order_ready",
          title: "🎉 Order Ready for Pickup!",
          message: `Your order #${orderNumber} is ready! Please pick it up from the counter.`,
        };
        break;
      case "delivered":
        notificationData = {
          type: "order_delivered",
          title: "✨ Order Completed!",
          message: `Your order #${orderNumber} has been picked up. Thank you for visiting Brew Haven!`,
        };
        break;
      case "cancelled":
        notificationData = {
          type: "order_cancelled",
          title: "❌ Order Cancelled",
          message: `Your order #${orderNumber} has been cancelled. If you have any questions, please contact us.`,
        };
        break;
    }

    if (notificationData) {
      await createNotification(
        order.user._id,
        notificationData.type,
        notificationData.title,
        notificationData.message,
        order._id,
      );
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
