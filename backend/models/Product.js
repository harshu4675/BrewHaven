const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide product name"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Please provide product description"],
  },
  price: {
    type: Number,
    required: [true, "Please provide product price"],
    min: 0,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  image: {
    type: String,
    default: "",
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  stock: {
    type: Number,
    default: 100,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  // NEW FIELDS FOR REVIEWS
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Product", productSchema);
