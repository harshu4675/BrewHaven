const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

const reviewRoutes = require("./routes/reviewRoutes");
dotenv.config();

connectDB();

const app = express();

app.use(
  cors({
    origin: ["https://your-own-brewhaven.netlify.app", "http://localhost:3000"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ ADD THIS ROOT ROUTE
app.get("/", (req, res) => {
  res.json({
    message: "☕ BrewHaven API is running successfully!",
    status: "OK",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      categories: "/api/categories",
      products: "/api/products",
      orders: "/api/orders",
      contacts: "/api/contacts",
      admin: "/api/admin",
      notifications: "/api/notifications",
      coupons: "/api/coupons",
      reviews: "/api/reviews",
    },
  });
});

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/products", require("./routes/products"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/contacts", require("./routes/contacts"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/coupons", require("./routes/coupons"));
app.use("/api/reviews", reviewRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
