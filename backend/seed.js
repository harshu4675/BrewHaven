const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

dotenv.config();

const User = require("./models/User");
const Category = require("./models/Category");
const Product = require("./models/Product");
const Settings = require("./models/Settings");

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB Connected");
};

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Settings.deleteMany({});

    // Create admin user
    console.log("👤 Creating users...");
    const adminPassword = await bcrypt.hash("Admin@2024", 12); // ← Changed here
    const admin = await User.create({
      name: "Admin User",
      email: "admin@brewhaven.com",
      password: adminPassword,
      role: "admin",
      phone: "+919876543210",
    });
    console.log("Admin created:", admin.email);

    const userPassword = await bcrypt.hash("User@2024", 12); // ← Changed here
    const user = await User.create({
      name: "John Doe",
      email: "user@example.com",
      password: userPassword,
      role: "user",
      phone: "+919876543211",
    });
    console.log("User created:", user.email);
    // Create sample coupons
    console.log("🎟️  Creating coupons...");
    const Coupon = require("./models/Coupon");
    await Coupon.deleteMany({});

    await Coupon.insertMany([
      {
        code: "WELCOME10",
        description: "Welcome offer - 10% off on your first order",
        discountType: "percentage",
        discountValue: 10,
        minOrderAmount: 200,
        maxDiscount: 100,
        usageLimit: null,
        perUserLimit: 1,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        isActive: true,
      },
      {
        code: "FLAT50",
        description: "Flat ₹50 off on orders above ₹300",
        discountType: "fixed",
        discountValue: 50,
        minOrderAmount: 300,
        usageLimit: 100,
        perUserLimit: 2,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        isActive: true,
      },
      {
        code: "PARTY20",
        description: "20% off on party orders",
        discountType: "percentage",
        discountValue: 20,
        minOrderAmount: 1000,
        maxDiscount: 500,
        usageLimit: 50,
        perUserLimit: 3,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        isActive: true,
      },
    ]);
    console.log("   ✅ Created 3 coupons\n");

    // Create categories
    const categories = await Category.insertMany([
      {
        name: "Coffee",
        description: "Premium coffee beverages",
        image:
          "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400",
        isActive: true,
      },
      {
        name: "Snacks",
        description: "Delicious light snacks",
        image:
          "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=400",
        isActive: true,
      },
      {
        name: "Desserts",
        description: "Sweet treats and pastries",
        image:
          "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400",
        isActive: true,
      },
      {
        name: "Combos",
        description: "Value meal combinations",
        image:
          "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400",
        isActive: true,
      },
    ]);
    console.log("Categories created:", categories.length);

    // Create products with INR prices
    const coffeeCategory = categories.find((c) => c.name === "Coffee");
    const snacksCategory = categories.find((c) => c.name === "Snacks");
    const dessertsCategory = categories.find((c) => c.name === "Desserts");
    const combosCategory = categories.find((c) => c.name === "Combos");

    const products = await Product.insertMany([
      // Coffee
      {
        name: "Espresso",
        description:
          "Rich, bold single shot of pure coffee essence. Our signature espresso blend.",
        price: 149,
        category: coffeeCategory._id,
        image:
          "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400",
        isAvailable: true,
        stock: 100,
        featured: true,
      },
      {
        name: "Cappuccino",
        description:
          "Espresso with steamed milk foam. A classic Italian coffee drink.",
        price: 199,
        category: coffeeCategory._id,
        image:
          "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400",
        isAvailable: true,
        stock: 100,
        featured: true,
      },
      {
        name: "Latte",
        description:
          "Smooth espresso with steamed milk. Creamy and comforting.",
        price: 219,
        category: coffeeCategory._id,
        image:
          "https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=400",
        isAvailable: true,
        stock: 100,
        featured: false,
      },
      {
        name: "Americano",
        description:
          "Espresso diluted with hot water. Bold flavor, lighter body.",
        price: 169,
        category: coffeeCategory._id,
        image:
          "https://images.unsplash.com/photo-1551030173-122aabc4489c?w=400",
        isAvailable: true,
        stock: 100,
        featured: false,
      },
      {
        name: "Mocha",
        description:
          "Espresso with chocolate and steamed milk. A chocolate lover's dream.",
        price: 249,
        category: coffeeCategory._id,
        image:
          "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=400",
        isAvailable: true,
        stock: 100,
        featured: true,
      },
      {
        name: "Cold Brew",
        description:
          "Smooth, refreshing cold-steeped coffee. Perfect for warm days.",
        price: 189,
        category: coffeeCategory._id,
        image:
          "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400",
        isAvailable: true,
        stock: 100,
        featured: false,
      },
      // Snacks
      {
        name: "Croissant",
        description:
          "Buttery, flaky French pastry. Freshly baked every morning.",
        price: 129,
        category: snacksCategory._id,
        image:
          "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400",
        isAvailable: true,
        stock: 50,
        featured: true,
      },
      {
        name: "Avocado Toast",
        description: "Smashed avocado on artisan toast with seasonings.",
        price: 299,
        category: snacksCategory._id,
        image:
          "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400",
        isAvailable: true,
        stock: 30,
        featured: false,
      },
      {
        name: "Paneer Sandwich",
        description: "Grilled sandwich with spiced paneer and vegetables.",
        price: 199,
        category: snacksCategory._id,
        image:
          "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400",
        isAvailable: true,
        stock: 40,
        featured: false,
      },
      {
        name: "Veg Puff",
        description: "Crispy puff pastry filled with spiced vegetables.",
        price: 69,
        category: snacksCategory._id,
        image:
          "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=400",
        isAvailable: true,
        stock: 60,
        featured: false,
      },
      // Desserts
      {
        name: "Chocolate Cake",
        description: "Rich, moist chocolate cake with ganache frosting.",
        price: 249,
        category: dessertsCategory._id,
        image:
          "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400",
        isAvailable: true,
        stock: 20,
        featured: true,
      },
      {
        name: "Cheesecake",
        description: "Creamy New York style cheesecake. Simply irresistible.",
        price: 279,
        category: dessertsCategory._id,
        image:
          "https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=400",
        isAvailable: true,
        stock: 15,
        featured: false,
      },
      {
        name: "Tiramisu",
        description: "Classic Italian dessert with coffee and mascarpone.",
        price: 299,
        category: dessertsCategory._id,
        image:
          "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400",
        isAvailable: true,
        stock: 15,
        featured: false,
      },
      {
        name: "Blueberry Muffin",
        description: "Freshly baked muffin loaded with blueberries.",
        price: 149,
        category: dessertsCategory._id,
        image:
          "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400",
        isAvailable: true,
        stock: 30,
        featured: false,
      },
      // Combos
      {
        name: "Breakfast Combo",
        description: "Coffee, croissant, and fresh orange juice.",
        price: 349,
        category: combosCategory._id,
        image:
          "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400",
        isAvailable: true,
        stock: 50,
        featured: true,
      },
      {
        name: "Afternoon Delight",
        description: "Latte with a slice of cake of your choice.",
        price: 399,
        category: combosCategory._id,
        image:
          "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400",
        isAvailable: true,
        stock: 50,
        featured: false,
      },
    ]);
    console.log("Products created:", products.length);

    // Create settings with Indian tax rate (GST)
    await Settings.create({
      cafeOpen: true,
      openTime: "08:00",
      closeTime: "22:00",
      taxRate: 18, // GST rate in India
      minOrderAmount: 0,
      deliveryFee: 0,
      cafeMessage:
        "We are currently closed. Please check back during our business hours.",
    });
    console.log("Settings created");

    console.log("\n✅ Database seeded successfully!");
    console.log("\nTest credentials:");
    console.log("Admin: admin@brewhaven.com / admin@2024");
    console.log("User: user@example.com / user@2024");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedData();
