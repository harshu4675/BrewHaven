const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const User = require("../models/User");
const { protect } = require("../middleware/auth");
const { admin } = require("../middleware/admin");

// Get user's notifications
router.get("/", protect, async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    let query = { user: req.user._id };

    if (unreadOnly === "true") {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort("-createdAt")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("orderId", "_id orderStatus total");

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      isRead: false,
    });

    res.json({
      notifications,
      unreadCount,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get unread count only
router.get("/unread-count", protect, async (req, res) => {
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

// Mark notification as read
router.put("/:id/read", protect, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true },
      { new: true },
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark all notifications as read
router.put("/mark-all-read", protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true },
    );

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a notification
router.delete("/:id", protect, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Clear all notifications
router.delete("/", protect, async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.user._id });
    res.json({ message: "All notifications cleared" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper function to create notification (used by other routes)
const createNotification = async (
  userId,
  type,
  title,
  message,
  orderId = null,
) => {
  try {
    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      orderId,
    });
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
};

// Notify all admins
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

module.exports = router;
module.exports.createNotification = createNotification;
module.exports.notifyAdmins = notifyAdmins;
