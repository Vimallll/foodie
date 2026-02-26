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

// Check chatbot API configuration
if (process.env.GROQ_API_KEY) {
  console.log("🤖 AI Chatbot: Enabled (Groq API - Fast & Free) ✅");
} else {
  console.log("⚠️  AI Chatbot: DISABLED - GROQ_API_KEY not found");
  console.log("   The chatbot will return errors until GROQ_API_KEY is configured");
  console.log("   To enable: Add GROQ_API_KEY to .env (Free & Fast)");
  console.log("   See backend/CHATBOT_SETUP.md for setup instructions");
}

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
app.use("/api/delivery/auth", require("./routes/deliveryAuth"));
app.use("/api/notifications", require("./routes/notifications"));

// ✅ CHATBOT ROUTE (IMPORTANT)
app.use("/api/chat", require("./routes/chat"));

// -------------------- HEALTH CHECK --------------------
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running successfully 🚀",
  });
});

// -------------------- SOCKET.IO SETUP --------------------
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  // Join room based on user role and ID
  socket.on('join-room', (data) => {
    const { userId, role, restaurantId } = data;

    // User joins their personal room
    socket.join(`user-${userId}`);

    // Restaurant admin/manager joins restaurant room
    if ((role === 'restaurant_admin' || role === 'manager') && restaurantId) {
      socket.join(`restaurant-${restaurantId}`);
    }

    // Delivery person joins delivery room
    if (role === 'delivery') {
      socket.join('delivery-partners');
    }

    // Super admin joins admin room
    if (role === 'superAdmin' || (role === 'manager')) {
      socket.join('admin');
    }

    console.log(`✅ User ${userId} joined rooms`);
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

// Make io available globally
app.set('io', io);

// Initialize socket helper
const socketHelper = require('./utils/socket');
socketHelper.initializeSocket(io);

// -------------------- DATABASE CONNECTION --------------------
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/foodie";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Socket.IO ready for connections`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });
