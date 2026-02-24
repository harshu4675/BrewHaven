const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  // Contact type
  type: {
    type: String,
    enum: ["general", "party_order", "bulk_order", "feedback", "complaint"],
    default: "general",
  },

  // Basic info
  name: {
    type: String,
    required: [true, "Please provide your name"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    trim: true,
  },
  phone: {
    type: String,
    required: [true, "Please provide your phone number"],
    trim: true,
  },

  // Party/Bulk Order specific fields
  eventType: {
    type: String,
    enum: ["birthday", "corporate", "wedding", "anniversary", "other"],
    default: "other",
  },
  eventDate: {
    type: Date,
  },
  eventTime: {
    type: String,
  },
  guestCount: {
    type: Number,
    min: 1,
  },
  venue: {
    type: String,
    enum: ["at_cafe", "delivery", "pickup"],
    default: "pickup",
  },
  venueAddress: {
    type: String,
  },

  // Order preferences
  preferredItems: [
    {
      type: String,
    },
  ],
  budget: {
    type: String,
  },
  specialRequirements: {
    type: String,
  },

  // General message
  message: {
    type: String,
  },

  // Status tracking
  status: {
    type: String,
    enum: ["new", "contacted", "confirmed", "completed", "cancelled"],
    default: "new",
  },
  adminNotes: {
    type: String,
  },

  isRead: {
    type: Boolean,
    default: false,
  },

  // Reference to user if logged in
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamp on save
contactSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("Contact", contactSchema);
