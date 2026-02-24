const express = require("express");
const router = express.Router();
const Category = require("../models/Category");
const { protect } = require("../middleware/auth");
const { admin } = require("../middleware/admin");

// Get all categories (public - active only)
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort("name");
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all categories (admin - including inactive)
// ✅ MUST BE BEFORE /:id route
router.get("/all", protect, admin, async (req, res) => {
  try {
    const categories = await Category.find().sort("name");
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single category
// ✅ AFTER /all route to prevent "all" being treated as :id
router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (category) {
      res.json(category);
    } else {
      res.status(404).json({ message: "Category not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create category (admin)
router.post("/", protect, admin, async (req, res) => {
  try {
    const { name, description, image } = req.body;
    const category = await Category.create({ name, description, image });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update category (admin)
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (category) {
      res.json(category);
    } else {
      res.status(404).json({ message: "Category not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete category (admin)
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (category) {
      res.json({ message: "Category removed" });
    } else {
      res.status(404).json({ message: "Category not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
