import express from "express";
import cors from "cors";

const app = express();

// Middleware to read JSON data
app.use(express.json());

// Allow frontend to talk to backend
// Allow frontend to talk to backend
// Allow frontend to talk to backend
app.use(
  cors({
    origin: true, // Allow any origin (Mobile, Localhost, Network)
    credentials: true
  })
);


import authRoutes from "./routes/authRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import farmerRoutes from "./routes/farmerRoutes.js";
import landRoutes from "./routes/landRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import sellerRoutes from "./routes/sellerRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";
import chatbotRoutes from "./routes/chatbotRoutes.js";
import weatherRoutes from "./routes/weatherRoutes.js";
import mandiPriceRoutes from "./routes/mandiPriceRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import rentalRequestRoutes from "./routes/rentalRequestRoutes.js";
import equipmentRoutes from "./routes/equipmentRoutes.js";
import rentOrderRoutes from "./routes/rentOrderRoutes.js";

app.use("/api/rent-orders", rentOrderRoutes);

app.use("/api/equipment", equipmentRoutes);

app.use("/api/rental-requests", rentalRequestRoutes);

app.use("/api/chat", chatRoutes);

app.use("/api/mandi-prices", mandiPriceRoutes);

app.use("/api/weather", weatherRoutes);

app.use("/api/chatbot", chatbotRoutes);

app.use("/api/recommendations", recommendationRoutes);

app.use("/api/payments", paymentRoutes);

app.use("/api/orders", orderRoutes);

app.use("/api/products", productRoutes);

app.use("/api/seller", sellerRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/lands", landRoutes);

app.use("/api/auth", authRoutes);

//app.use("/api/test", testRoutes);

app.use("/api/farmer", farmerRoutes);


// Test route
// Test route
app.get("/", (req, res) => {
  res.json({ message: "API is working fine" });
});

// GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
  console.error("🔥 Global Error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "production" ? null : err.stack
  });
});


export default app;
