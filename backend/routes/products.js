const express = require("express");
const router = express.Router();
const mongoose = require("mongoose"); // ADD THIS
const Product = require("../models/Product");
const { protect } = require("../middleware/auth");
const { admin } = require("../middleware/admin");

// Get all products
router.get("/", async (req, res) => {
  try {
    const { category, search, featured } = req.query;
    let query = { isAvailable: true };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (featured === "true") {
      query.featured = true;
    }

    const products = await Product.find(query)
      .populate("category", "name")
      .sort("-createdAt");
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get all products (admin)
router.get("/all", protect, admin, async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category", "name")
      .sort("-createdAt");
    res.json(products);
  } catch (error) {
    console.error("Error fetching all products:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get single product - FIXED VERSION
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid product ID format",
        error: "INVALID_ID",
      });
    }

    const product = await Product.findById(id).populate("category", "name");

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
        error: "PRODUCT_NOT_FOUND",
      });
    }

    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);

    // Handle CastError (invalid ObjectId)
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid product ID",
        error: "INVALID_ID",
      });
    }

    res.status(500).json({
      message: "Server error while fetching product",
      error: error.message,
    });
  }
});

// Create product (admin)
router.post("/", protect, admin, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    const populatedProduct = await Product.findById(product._id).populate(
      "category",
      "name",
    );
    res.status(201).json(populatedProduct);
  } catch (error) {
    console.error("Error creating product:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }

    res.status(500).json({ message: error.message });
  }
});

// Update product (admin)
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate("category", "name");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("Error updating product:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }

    res.status(500).json({ message: error.message });
  }
});

// Delete product (admin)
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({
      message: "Product removed successfully",
      deletedProduct: product,
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: error.message });
  }
});

// Update stock (admin)
router.patch("/:id/stock", protect, admin, async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    // Validate stock value
    if (stock === undefined || stock < 0) {
      return res.status(400).json({ message: "Invalid stock value" });
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { stock },
      { new: true, runValidators: true },
    ).populate("category", "name");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("Error updating stock:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
