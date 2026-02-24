// models/Order.js - UPDATED VERSION
const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: String,
  price: Number,
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  image: String,
  // Add review tracking for each product
  hasReview: {
    type: Boolean,
    default: false,
  },
  reviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Review",
    default: null,
  },
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [orderItemSchema],
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    phone: String,
  },
  subtotal: {
    type: Number,
    required: true,
  },
  tax: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  orderType: {
    type: String,
    enum: ["pickup", "delivery"],
    default: "pickup",
  },
  paymentMethod: {
    type: String,
    default: "razorpay",
  },
  paymentId: {
    type: String,
  },
  razorpayOrderId: {
    type: String,
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed", "refunded"],
    default: "pending",
  },
  orderStatus: {
    type: String,
    enum: [
      "pending",
      "confirmed",
      "preparing",
      "ready",
      "delivered",
      "cancelled",
    ],
    default: "pending",
  },
  notes: {
    type: String,
  },
  estimatedTime: {
    type: Number, // in minutes
    default: 15,
  },

  // ✅ NEW: Review tracking fields
  canReview: {
    type: Boolean,
    default: false,
  },
  hasReviewed: {
    type: Boolean,
    default: false,
  },
  reviewReminderSent: {
    type: Boolean,
    default: false,
  },
  reviewedAt: {
    type: Date,
    default: null,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  deliveredAt: {
    type: Date,
    default: null,
  },
  discount: {
    type: Number,
    default: 0,
  },
  couponCode: {
    type: String,
    default: null,
  },
});

// ✅ NEW: Middleware to enable reviews when order is delivered
orderSchema.pre("save", function (next) {
  this.updatedAt = new Date();

  // Enable review when order is delivered
  if (this.isModified("orderStatus") && this.orderStatus === "delivered") {
    this.canReview = true;
    this.deliveredAt = new Date();
  }

  next();
});

// ✅ NEW: Method to check if order can be reviewed
orderSchema.methods.isReviewable = function () {
  return (
    this.orderStatus === "delivered" &&
    this.paymentStatus === "paid" &&
    !this.hasReviewed
  );
};

// ✅ NEW: Virtual for days since delivery
orderSchema.virtual("daysSinceDelivery").get(function () {
  if (!this.deliveredAt) return 0;
  const diffTime = Math.abs(new Date() - this.deliveredAt);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

module.exports = mongoose.model("Order", orderSchema);
