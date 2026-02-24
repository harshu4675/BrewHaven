const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, "Coupon code is required"],
    unique: true,
    uppercase: true,
    trim: true,
  },
  description: {
    type: String,
    default: "",
  },
  discountType: {
    type: String,
    enum: ["percentage", "fixed"],
    required: true,
    default: "percentage",
  },
  discountValue: {
    type: Number,
    required: [true, "Discount value is required"],
    min: 0,
  },
  minOrderAmount: {
    type: Number,
    default: 0,
  },
  maxDiscount: {
    type: Number,
    default: null, // For percentage coupons, max discount cap
  },
  usageLimit: {
    type: Number,
    default: null, // null means unlimited
  },
  usedCount: {
    type: Number,
    default: 0,
  },
  perUserLimit: {
    type: Number,
    default: 1, // How many times a single user can use
  },
  usedBy: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      usedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  validFrom: {
    type: Date,
    default: Date.now,
  },
  validUntil: {
    type: Date,
    required: [true, "Expiry date is required"],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Check if coupon is valid
couponSchema.methods.isValid = function (userId = null, orderAmount = 0) {
  const now = new Date();

  // Check if active
  if (!this.isActive) {
    return { valid: false, message: "This coupon is no longer active" };
  }

  // Check date validity
  if (now < this.validFrom) {
    return { valid: false, message: "This coupon is not yet valid" };
  }

  if (now > this.validUntil) {
    return { valid: false, message: "This coupon has expired" };
  }

  // Check usage limit
  if (this.usageLimit && this.usedCount >= this.usageLimit) {
    return { valid: false, message: "This coupon has reached its usage limit" };
  }

  // Check minimum order amount
  if (orderAmount < this.minOrderAmount) {
    return {
      valid: false,
      message: `Minimum order amount of ₹${this.minOrderAmount} required for this coupon`,
    };
  }

  // Check per user limit
  if (userId && this.perUserLimit) {
    const userUsage = this.usedBy.filter(
      (u) => u.user.toString() === userId.toString(),
    ).length;

    if (userUsage >= this.perUserLimit) {
      return { valid: false, message: "You have already used this coupon" };
    }
  }

  return { valid: true, message: "Coupon is valid" };
};

// Calculate discount
couponSchema.methods.calculateDiscount = function (orderAmount) {
  let discount = 0;

  if (this.discountType === "percentage") {
    discount = (orderAmount * this.discountValue) / 100;
    // Apply max discount cap if set
    if (this.maxDiscount && discount > this.maxDiscount) {
      discount = this.maxDiscount;
    }
  } else {
    // Fixed discount
    discount = this.discountValue;
  }

  // Discount cannot exceed order amount
  if (discount > orderAmount) {
    discount = orderAmount;
  }

  return Math.round(discount * 100) / 100; // Round to 2 decimal places
};

module.exports = mongoose.model("Coupon", couponSchema);
