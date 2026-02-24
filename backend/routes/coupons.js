const express = require("express");
const router = express.Router();
const Coupon = require("../models/Coupon");
const { protect } = require("../middleware/auth");
const { admin } = require("../middleware/admin");

// Validate and apply coupon (for users)
router.post("/validate", protect, async (req, res) => {
  try {
    const { code, orderAmount } = req.body;

    if (!code) {
      return res.status(400).json({ message: "Coupon code is required" });
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase().trim(),
    });

    if (!coupon) {
      return res.status(404).json({ message: "Invalid coupon code" });
    }

    // Check if coupon is valid
    const validation = coupon.isValid(req.user._id, orderAmount);

    if (!validation.valid) {
      return res.status(400).json({ message: validation.message });
    }

    // Calculate discount
    const discount = coupon.calculateDiscount(orderAmount);

    res.json({
      valid: true,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discount: discount,
        minOrderAmount: coupon.minOrderAmount,
        maxDiscount: coupon.maxDiscount,
      },
      message: `Coupon applied! You save ₹${discount.toFixed(2)}`,
    });
  } catch (error) {
    console.error("Coupon validation error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get all coupons (admin)
router.get("/", protect, admin, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort("-createdAt");
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get active coupons for users (public view)
router.get("/active", async (req, res) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now },
      $or: [
        { usageLimit: null },
        { $expr: { $lt: ["$usedCount", "$usageLimit"] } },
      ],
    }).select(
      "code description discountType discountValue minOrderAmount maxDiscount validUntil",
    );

    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single coupon (admin)
router.get("/:id", protect, admin, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id).populate(
      "usedBy.user",
      "name email",
    );

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create coupon (admin)
router.post("/", protect, admin, async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscount,
      usageLimit,
      perUserLimit,
      validFrom,
      validUntil,
      isActive,
    } = req.body;

    // Check if code already exists
    const existingCoupon = await Coupon.findOne({
      code: code.toUpperCase().trim(),
    });

    if (existingCoupon) {
      return res.status(400).json({ message: "Coupon code already exists" });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase().trim(),
      description,
      discountType,
      discountValue,
      minOrderAmount: minOrderAmount || 0,
      maxDiscount: maxDiscount || null,
      usageLimit: usageLimit || null,
      perUserLimit: perUserLimit || 1,
      validFrom: validFrom || new Date(),
      validUntil,
      isActive: isActive !== false,
    });

    res.status(201).json(coupon);
  } catch (error) {
    console.error("Coupon creation error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Update coupon (admin)
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    // Update fields
    const updateFields = [
      "description",
      "discountType",
      "discountValue",
      "minOrderAmount",
      "maxDiscount",
      "usageLimit",
      "perUserLimit",
      "validFrom",
      "validUntil",
      "isActive",
    ];

    updateFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        coupon[field] = req.body[field];
      }
    });

    // Only allow code change if coupon hasn't been used
    if (req.body.code && coupon.usedCount === 0) {
      coupon.code = req.body.code.toUpperCase().trim();
    }

    await coupon.save();
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete coupon (admin)
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    res.json({ message: "Coupon deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Toggle coupon status (admin)
router.patch("/:id/toggle", protect, admin, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    res.json({
      message: `Coupon ${coupon.isActive ? "activated" : "deactivated"}`,
      isActive: coupon.isActive,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark coupon as used (internal use after successful order)
router.post("/:code/use", protect, async (req, res) => {
  try {
    const coupon = await Coupon.findOne({
      code: req.params.code.toUpperCase(),
    });

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    coupon.usedCount += 1;
    coupon.usedBy.push({
      user: req.user._id,
      usedAt: new Date(),
    });

    await coupon.save();
    res.json({ message: "Coupon usage recorded" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
