const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Settings = require("../models/Settings");
const Notification = require("../models/Notification");
const { protect } = require("../middleware/auth");
const { admin } = require("../middleware/admin");

// Get settings
router.get("/settings", async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }

    // Calculate if shop is currently open
    const isCurrentlyOpen = settings.isShopOpen();

    res.json({
      ...settings.toObject(),
      isCurrentlyOpen,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update settings (admin)
router.put("/settings", protect, admin, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create(req.body);
    } else {
      Object.assign(settings, req.body);
      settings.updatedAt = new Date();
      await settings.save();
    }

    const isCurrentlyOpen = settings.isShopOpen();

    res.json({
      ...settings.toObject(),
      isCurrentlyOpen,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Toggle shop open/close (admin)
router.put("/toggle-shop", protect, admin, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }

    settings.cafeOpen = !settings.cafeOpen;
    settings.updatedAt = new Date();
    await settings.save();

    // Notify all users about shop status change
    const status = settings.cafeOpen ? "open" : "closed";

    res.json({
      message: `Shop is now ${status}`,
      cafeOpen: settings.cafeOpen,
      isCurrentlyOpen: settings.isShopOpen(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all users (admin)
router.get("/users", protect, admin, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort("-createdAt");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user role (admin)
router.put("/users/:id/role", protect, admin, async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true },
    ).select("-password");

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get admin notifications count
router.get("/notifications/count", protect, admin, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user._id,
      isRead: false,
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
