const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { protect } = require("../middleware/auth");
const { admin } = require("../middleware/admin");

// Helper function to notify admins
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

// Submit party/bulk order inquiry
router.post("/party-order", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      eventType,
      eventDate,
      eventTime,
      guestCount,
      venue,
      venueAddress,
      preferredItems,
      budget,
      specialRequirements,
      message,
    } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !eventDate || !guestCount) {
      return res.status(400).json({
        message: "Please fill in all required fields",
      });
    }

    const contact = await Contact.create({
      type: guestCount >= 50 ? "bulk_order" : "party_order",
      name,
      email,
      phone,
      eventType,
      eventDate,
      eventTime,
      guestCount,
      venue,
      venueAddress,
      preferredItems,
      budget,
      specialRequirements,
      message,
      user: req.user?._id,
    });

    // Notify admins about new party/bulk order inquiry
    const orderType = guestCount >= 50 ? "Bulk Order" : "Party Order";
    await notifyAdmins(
      "new_order",
      `🎉 New ${orderType} Inquiry!`,
      `${name} has submitted a ${orderType.toLowerCase()} inquiry for ${guestCount} guests on ${new Date(eventDate).toLocaleDateString()}.`,
      null,
    );

    res.status(201).json({
      message:
        "Your inquiry has been submitted successfully! We will contact you soon.",
      inquiry: contact,
    });
  } catch (error) {
    console.error("Party order submission error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Submit general contact form
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, subject, message, type } = req.body;

    const contact = await Contact.create({
      name,
      email,
      phone,
      message: `Subject: ${subject}\n\n${message}`,
      type: type || "general",
    });

    // Notify admins
    await notifyAdmins(
      "general",
      "📧 New Contact Message",
      `${name} sent a message: "${subject}"`,
      null,
    );

    res.status(201).json({ message: "Message sent successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all inquiries (admin)
router.get("/", protect, admin, async (req, res) => {
  try {
    const { type, status } = req.query;
    let query = {};

    if (type && type !== "all") {
      query.type = type;
    }

    if (status && status !== "all") {
      query.status = status;
    }

    const contacts = await Contact.find(query)
      .populate("user", "name email")
      .sort("-createdAt");

    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get inquiry stats (admin)
// ✅ MUST BE BEFORE /:id route
router.get("/stats/summary", protect, admin, async (req, res) => {
  try {
    const total = await Contact.countDocuments();
    const newInquiries = await Contact.countDocuments({ status: "new" });
    const partyOrders = await Contact.countDocuments({ type: "party_order" });
    const bulkOrders = await Contact.countDocuments({ type: "bulk_order" });
    const unread = await Contact.countDocuments({ isRead: false });

    res.json({
      total,
      newInquiries,
      partyOrders,
      bulkOrders,
      unread,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single inquiry (admin)
// ✅ AFTER /stats/summary to prevent "stats" being treated as :id
router.get("/:id", protect, admin, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id).populate(
      "user",
      "name email phone",
    );

    if (!contact) {
      return res.status(404).json({ message: "Inquiry not found" });
    }

    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update inquiry status (admin)
router.put("/:id/status", protect, admin, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      {
        status,
        adminNotes,
        isRead: true,
      },
      { new: true },
    );

    if (!contact) {
      return res.status(404).json({ message: "Inquiry not found" });
    }

    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark as read (admin)
router.put("/:id/read", protect, admin, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true },
    );

    if (contact) {
      res.json(contact);
    } else {
      res.status(404).json({ message: "Contact not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete inquiry (admin)
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (contact) {
      res.json({ message: "Inquiry deleted" });
    } else {
      res.status(404).json({ message: "Contact not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
