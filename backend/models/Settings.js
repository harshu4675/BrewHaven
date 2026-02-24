const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
  cafeOpen: {
    type: Boolean,
    default: true,
  },
  autoOpenClose: {
    type: Boolean,
    default: true, // If true, shop auto opens/closes based on timing
  },
  openTime: {
    type: String,
    default: "10:00", // 10 AM
  },
  closeTime: {
    type: String,
    default: "22:00", // 10 PM
  },
  taxRate: {
    type: Number,
    default: 18,
  },
  minOrderAmount: {
    type: Number,
    default: 0,
  },
  deliveryFee: {
    type: Number,
    default: 0,
  },
  orderType: {
    type: String,
    enum: ["pickup", "delivery", "both"],
    default: "pickup",
  },
  pickupMessage: {
    type: String,
    default:
      "Please pick up your order from the counter. We will notify you when your order is ready!",
  },
  closedMessage: {
    type: String,
    default:
      "Sorry, we are currently closed. Please visit us during our business hours.",
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Method to check if shop is currently open based on time
settingsSchema.methods.isShopOpen = function () {
  if (!this.autoOpenClose) {
    return this.cafeOpen;
  }

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const [openHour, openMin] = this.openTime.split(":").map(Number);
  const [closeHour, closeMin] = this.closeTime.split(":").map(Number);

  const openMinutes = openHour * 60 + openMin;
  const closeMinutes = closeHour * 60 + closeMin;

  // Check if current time is within open hours
  if (openMinutes < closeMinutes) {
    // Normal case: open and close on same day (e.g., 10:00 - 22:00)
    return (
      currentTime >= openMinutes && currentTime < closeMinutes && this.cafeOpen
    );
  } else {
    // Overnight case: open at night, close in morning (e.g., 22:00 - 06:00)
    return (
      (currentTime >= openMinutes || currentTime < closeMinutes) &&
      this.cafeOpen
    );
  }
};

module.exports = mongoose.model("Settings", settingsSchema);
