const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Review = require("../models/Review");
const Order = require("../models/Order");
const { protect } = require("../middleware/auth");
const { admin } = require("../middleware/admin");

// ============================================
// PUBLIC ROUTES - Specific routes FIRST
// ============================================

// Get all reviews for a product with my-review sub-route
// ✅ /my-review MUST come BEFORE /:productId
router.get("/product/:productId/my-review", protect, async (req, res) => {
  try {
    const review = await Review.findOne({
      product: req.params.productId,
      user: req.user._id,
    }).populate("user", "name");

    res.json(review);
  } catch (error) {
    console.error("Error in GET /product/:productId/my-review:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get all reviews for a product
// ✅ Now this comes AFTER /my-review
router.get("/product/:productId", async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const reviews = await Review.find({
      product: productId,
      isApproved: true,
    })
      .populate("user", "name")
      .sort("-createdAt");

    res.json(reviews);
  } catch (error) {
    console.error("Error in GET /product/:productId:", error);
    res.status(500).json({ message: error.message });
  }
});

// ============================================
// PROTECTED ROUTES - Specific routes BEFORE dynamic params
// ============================================

// Get orders that can be reviewed
// ✅ Must come before /can-review/:productId
router.get("/reviewable-orders", protect, async (req, res) => {
  try {
    console.log("Fetching reviewable orders for user:", req.user._id);

    // Get all delivered orders for this user
    const orders = await Order.find({
      user: req.user._id,
      orderStatus: "delivered",
      paymentStatus: "paid",
    })
      .sort("-createdAt")
      .limit(10)
      .lean(); // Use lean() for better performance

    console.log(`Found ${orders.length} delivered orders`);

    // Filter orders that have unreviewed items
    const reviewableOrders = [];

    for (const order of orders) {
      const unreviewedItems = [];

      for (const item of order.items) {
        if (!item.product) continue;

        try {
          // Check if this item has been reviewed
          const existingReview = await Review.findOne({
            user: req.user._id,
            product: item.product,
            order: order._id,
          });

          if (!existingReview) {
            unreviewedItems.push({
              product: {
                _id: item.product,
                name: item.name,
                image: item.image,
                price: item.price,
              },
              name: item.name,
              image: item.image,
              price: item.price,
              quantity: item.quantity,
            });
          }
        } catch (err) {
          console.error("Error checking review for item:", err);
        }
      }

      // Only include orders with unreviewed items
      if (unreviewedItems.length > 0) {
        reviewableOrders.push({
          _id: order._id,
          items: unreviewedItems,
          createdAt: order.createdAt,
          deliveredAt: order.updatedAt,
          total: order.total,
        });
      }
    }

    console.log(`Found ${reviewableOrders.length} reviewable orders`);
    res.json(reviewableOrders);
  } catch (error) {
    console.error("Error in GET /reviewable-orders:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get products user can review (from delivered orders)
// ✅ Must come before /can-review/:productId
router.get("/reviewable-products", protect, async (req, res) => {
  try {
    console.log("Fetching reviewable products for user:", req.user._id);

    // Get all delivered orders with lean() for better performance
    const deliveredOrders = await Order.find({
      user: req.user._id,
      orderStatus: "delivered",
    })
      .sort("-createdAt")
      .lean();

    console.log(`Found ${deliveredOrders.length} delivered orders`);

    if (deliveredOrders.length === 0) {
      return res.json([]);
    }

    // Collect all product IDs from orders
    const productOrderMap = new Map();

    for (const order of deliveredOrders) {
      if (!order.items || !Array.isArray(order.items)) continue;

      for (const item of order.items) {
        if (!item.product) continue;

        const productId = item.product.toString();

        // Only keep the first occurrence (most recent order)
        if (!productOrderMap.has(productId)) {
          productOrderMap.set(productId, {
            product: {
              _id: item.product,
              name: item.name || "Unknown Product",
              image: item.image || "",
              description: item.description || "",
              price: item.price || 0,
            },
            orderId: order._id,
            orderDate: order.createdAt,
          });
        }
      }
    }

    console.log(`Found ${productOrderMap.size} unique products`);

    if (productOrderMap.size === 0) {
      return res.json([]);
    }

    // Get all product IDs
    const productIds = Array.from(productOrderMap.keys());

    // Get existing reviews for these products by this user
    const existingReviews = await Review.find({
      user: req.user._id,
      product: { $in: productIds },
    }).lean();

    console.log(`User has ${existingReviews.length} existing reviews`);

    // Create a set of reviewed product IDs
    const reviewedProductIds = new Set(
      existingReviews.map((r) => r.product.toString()),
    );

    // Filter out already reviewed products
    const reviewableProducts = [];

    for (const [productId, data] of productOrderMap) {
      if (!reviewedProductIds.has(productId)) {
        reviewableProducts.push(data);
      }
    }

    console.log(`Returning ${reviewableProducts.length} reviewable products`);
    res.json(reviewableProducts);
  } catch (error) {
    console.error("Error in GET /reviewable-products:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      message: "Failed to fetch reviewable products",
      error: error.message,
    });
  }
});

// Get user's all reviews
// ✅ Must come before /:id pattern
router.get("/my-reviews", protect, async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate("product", "name image")
      .sort("-createdAt");

    res.json(reviews);
  } catch (error) {
    console.error("Error in GET /my-reviews:", error);
    res.status(500).json({ message: error.message });
  }
});

// Check if user can review a specific order
// ✅ Must come before /can-review/:productId
router.get("/can-review-order/:orderId", protect, async (req, res) => {
  try {
    const { orderId } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findById(orderId).lean();

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if order belongs to user
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Check if order is delivered and paid
    const canReview =
      order.orderStatus === "delivered" && order.paymentStatus === "paid";

    // Get products that haven't been reviewed yet
    const reviewableProducts = [];

    for (const item of order.items) {
      if (!item.product) continue;

      const existingReview = await Review.findOne({
        user: req.user._id,
        product: item.product,
        order: order._id,
      });

      if (!existingReview) {
        reviewableProducts.push({
          productId: item.product,
          name: item.name,
          image: item.image,
          quantity: item.quantity,
        });
      }
    }

    res.json({
      canReview: canReview && reviewableProducts.length > 0,
      orderId: order._id,
      reviewableProducts,
      deliveredAt: order.updatedAt,
    });
  } catch (error) {
    console.error("Error in GET /can-review-order/:orderId:", error);
    res.status(500).json({ message: error.message });
  }
});

// Check if user can review a product
// ✅ Must come before generic /:id
router.get("/can-review/:productId", protect, async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    // Check if user has ordered this product and it's delivered
    const order = await Order.findOne({
      user: req.user._id,
      "items.product": productId,
      orderStatus: "delivered",
    });

    if (!order) {
      return res.json({
        canReview: false,
        message: "You can only review products you've purchased and received",
      });
    }

    // Check if user has already reviewed this product
    const existingReview = await Review.findOne({
      product: productId,
      user: req.user._id,
      order: order._id,
    });

    if (existingReview) {
      return res.json({
        canReview: false,
        message: "You have already reviewed this product",
        review: existingReview,
      });
    }

    res.json({
      canReview: true,
      orderId: order._id,
    });
  } catch (error) {
    console.error("Error in GET /can-review/:productId:", error);
    res.status(500).json({ message: error.message });
  }
});

// ============================================
// ADMIN ROUTES - Specific admin routes FIRST
// ============================================

// Admin: Get all reviews
// ✅ Must come before /:id patterns
router.get("/admin/all", protect, admin, async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user", "name email")
      .populate("product", "name")
      .sort("-createdAt");

    res.json(reviews);
  } catch (error) {
    console.error("Error in GET /admin/all:", error);
    res.status(500).json({ message: error.message });
  }
});

// Admin: Delete review
// ✅ Must come BEFORE user DELETE /:id
router.delete("/admin/:id", protect, admin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid review ID" });
    }

    const review = await Review.findByIdAndDelete(id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /admin/:id:", error);
    res.status(500).json({ message: error.message });
  }
});

// ============================================
// POST ROUTES - Specific routes before params
// ============================================

// Bulk create reviews for an order
// ✅ Must come before /:id routes
router.post("/bulk-review", protect, async (req, res) => {
  try {
    const { orderId, reviews, serviceRating } = req.body;

    console.log("Bulk review request:", {
      orderId,
      reviewCount: reviews?.length,
    });

    // Validate input
    if (!orderId || !reviews || !Array.isArray(reviews)) {
      return res.status(400).json({
        message: "Order ID and reviews array are required",
      });
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    // Verify order exists and belongs to user
    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
      orderStatus: "delivered",
    });

    if (!order) {
      return res.status(400).json({
        message: "Order not found or not eligible for review",
      });
    }

    const createdReviews = [];
    const errors = [];

    // Process each review
    for (const reviewData of reviews) {
      const { productId, rating, title, comment, images } = reviewData;

      try {
        // Skip if no rating or invalid rating
        if (!rating || rating < 1 || rating > 5) {
          errors.push({ productId, message: "Invalid rating" });
          continue;
        }

        // Check if already reviewed
        const existingReview = await Review.findOne({
          user: req.user._id,
          product: productId,
          order: orderId,
        });

        if (existingReview) {
          errors.push({ productId, message: "Already reviewed" });
          continue;
        }

        // Verify product is in order
        const productInOrder = order.items.some(
          (item) =>
            item.product && item.product.toString() === productId.toString(),
        );

        if (!productInOrder) {
          errors.push({ productId, message: "Product not in order" });
          continue;
        }

        // Create the review
        const review = await Review.create({
          product: productId,
          user: req.user._id,
          order: orderId,
          rating,
          title: title || "Great product!",
          comment: comment || "Loved it!",
          images: images || [],
          isVerifiedPurchase: true,
        });

        createdReviews.push(review);
      } catch (err) {
        console.error("Error creating individual review:", err);
        errors.push({ productId, message: err.message });
      }
    }

    // Log service rating if provided
    if (serviceRating && serviceRating.overall > 0) {
      console.log("Service rating received:", serviceRating);
    }

    console.log(
      `Created ${createdReviews.length} reviews with ${errors.length} errors`,
    );

    res.status(201).json({
      success: true,
      message: `${createdReviews.length} review(s) created successfully`,
      reviews: createdReviews,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error in POST /bulk-review:", error);
    res.status(500).json({ message: error.message });
  }
});

// Mark review as helpful
// ✅ /:id/helpful must come before generic POST /:id
router.post("/:id/helpful", protect, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid review ID" });
    }

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const hasMarked = review.helpfulBy.includes(req.user._id);

    if (hasMarked) {
      review.helpfulBy = review.helpfulBy.filter(
        (userId) => userId.toString() !== req.user._id.toString(),
      );
      review.helpfulCount = Math.max(0, review.helpfulCount - 1);
    } else {
      review.helpfulBy.push(req.user._id);
      review.helpfulCount += 1;
    }

    await review.save();

    res.json({ helpfulCount: review.helpfulCount, marked: !hasMarked });
  } catch (error) {
    console.error("Error in POST /:id/helpful:", error);
    res.status(500).json({ message: error.message });
  }
});

// Admin: Respond to review
// ✅ /:id/respond must come before generic routes
router.post("/:id/respond", protect, admin, async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid review ID" });
    }

    if (!message) {
      return res.status(400).json({ message: "Response message is required" });
    }

    const review = await Review.findByIdAndUpdate(
      id,
      {
        adminResponse: {
          message,
          respondedAt: new Date(),
        },
      },
      { new: true },
    );

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.json(review);
  } catch (error) {
    console.error("Error in POST /:id/respond:", error);
    res.status(500).json({ message: error.message });
  }
});

// Create a review
// ✅ Generic POST / comes after all specific POST routes
router.post("/", protect, async (req, res) => {
  try {
    const { productId, orderId, rating, title, comment, images } = req.body;

    // Also support 'product' and 'order' field names
    const productIdFinal = productId || req.body.product;
    const orderIdFinal = orderId || req.body.order;

    console.log("Creating review:", { productIdFinal, orderIdFinal, rating });

    if (!productIdFinal || !orderIdFinal) {
      return res.status(400).json({
        message: "Product ID and Order ID are required",
      });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

    // Verify order exists and is delivered
    const order = await Order.findOne({
      _id: orderIdFinal,
      user: req.user._id,
      "items.product": productIdFinal,
      orderStatus: "delivered",
    });

    if (!order) {
      return res.status(400).json({
        message: "Order not found or not eligible for review",
      });
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({
      product: productIdFinal,
      user: req.user._id,
      order: orderIdFinal,
    });

    if (existingReview) {
      return res.status(400).json({
        message: "You have already reviewed this product",
      });
    }

    // Create review
    const review = await Review.create({
      product: productIdFinal,
      user: req.user._id,
      order: orderIdFinal,
      rating,
      title: title || "Great product!",
      comment: comment || "I enjoyed this product.",
      images: images || [],
    });

    const populatedReview = await Review.findById(review._id).populate(
      "user",
      "name",
    );

    console.log("Review created successfully:", review._id);
    res.status(201).json(populatedReview);
  } catch (error) {
    console.error("Error in POST /:", error);
    res.status(500).json({ message: error.message });
  }
});

// ============================================
// PATCH/PUT/DELETE with :id param - MUST BE LAST
// ============================================

// Admin: Approve/reject review
router.patch("/:id/approve", protect, admin, async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid review ID" });
    }

    const review = await Review.findByIdAndUpdate(
      id,
      { isApproved },
      { new: true },
    );

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.json(review);
  } catch (error) {
    console.error("Error in PATCH /:id/approve:", error);
    res.status(500).json({ message: error.message });
  }
});

// Update a review
router.put("/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid review ID" });
    }

    const review = await Review.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const { rating, title, comment, images } = req.body;

    review.rating = rating || review.rating;
    review.title = title || review.title;
    review.comment = comment || review.comment;
    review.images = images || review.images;

    await review.save();

    const updatedReview = await Review.findById(review._id).populate(
      "user",
      "name",
    );

    res.json(updatedReview);
  } catch (error) {
    console.error("Error in PUT /:id:", error);
    res.status(500).json({ message: error.message });
  }
});

// Delete a review (user)
// ✅ Must come AFTER /admin/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid review ID" });
    }

    const review = await Review.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    await Review.findByIdAndDelete(id);

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /:id:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
