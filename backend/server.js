const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
const envPath = path.join(__dirname, ".env");
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error("❌ Error loading .env file:", result.error);
  console.error("Expected path:", envPath);
}

// Validate required environment variables
if (!process.env.JWT_SECRET) {
  console.error("❌ ERROR: JWT_SECRET is missing in .env");
  process.exit(1);
}

console.log("✅ Environment variables loaded");

const app = express();

// -------------------- MIDDLEWARE --------------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -------------------- ROUTES --------------------
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/foods", require("./routes/foods"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/cart", require("./routes/cart"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/restaurants", require("./routes/restaurants"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/restaurant-admin", require("./routes/restaurantAdmin"));
app.use("/api/delivery", require("./routes/delivery"));

// ✅ CHATBOT ROUTE (IMPORTANT)
app.use("/api/chat", require("./routes/chat"));

// -------------------- HEALTH CHECK --------------------
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running successfully 🚀",
  });
});

// -------------------- DATABASE CONNECTION --------------------
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/foodie";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });
