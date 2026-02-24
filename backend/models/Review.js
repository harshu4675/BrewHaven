const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  rating: {
    type: Number,
    required: [true, "Please provide a rating"],
    min: 1,
    max: 5,
  },
  title: {
    type: String,
    required: [true, "Please provide a review title"],
    trim: true,
    maxlength: [100, "Title cannot exceed 100 characters"],
  },
  comment: {
    type: String,
    required: [true, "Please provide a review comment"],
    maxlength: [500, "Comment cannot exceed 500 characters"],
  },
  images: [
    {
      type: String,
    },
  ],
  isVerifiedPurchase: {
    type: Boolean,
    default: true,
  },
  helpfulCount: {
    type: Number,
    default: 0,
  },
  helpfulBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  isApproved: {
    type: Boolean,
    default: true, // Auto-approve or set to false for moderation
  },
  adminResponse: {
    message: String,
    respondedAt: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure user can only review a product once per order
reviewSchema.index({ product: 1, user: 1, order: 1 }, { unique: true });

// Calculate average rating for product
reviewSchema.statics.calcAverageRating = async function (productId) {
  const stats = await this.aggregate([
    { $match: { product: productId, isApproved: true } },
    {
      $group: {
        _id: "$product",
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await mongoose.model("Product").findByIdAndUpdate(productId, {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      totalReviews: stats[0].totalReviews,
    });
  } else {
    await mongoose.model("Product").findByIdAndUpdate(productId, {
      averageRating: 0,
      totalReviews: 0,
    });
  }
};

// Update product rating after save
reviewSchema.post("save", function () {
  this.constructor.calcAverageRating(this.product);
});

// Update product rating after delete
reviewSchema.post("remove", function () {
  this.constructor.calcAverageRating(this.product);
});

module.exports = mongoose.model("Review", reviewSchema);
