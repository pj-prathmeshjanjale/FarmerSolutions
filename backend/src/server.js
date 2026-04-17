import "dotenv/config";
import http from "http";
import app from "./app.js";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import { initMandiCron } from "./jobs/mandiCron.js";
const PORT = process.env.PORT || 5000;

// Wrap startup in async function
const startServer = async () => {
  try {
    // Connect MongoDB FIRST
    await connectDB();

    // Init background cron jobs
    initMandiCron();

    // Create HTTP server
    const server = http.createServer(app);

    const io = new Server(server, {
      cors: {
        origin: "*", // Allow mobile/network connections
        credentials: true
      }
    });

    global.io = io;

    io.on("connection", (socket) => {
      // console.log("🟢 User connected:", socket.id);

      socket.on("joinRoom", (rentalRequestId) => {
        const roomId = String(rentalRequestId);
        socket.join(roomId);
        // console.log(`🏠 Socket ${socket.id} joined room: ${roomId}`);
      });

      socket.on("joinUserRoom", (userId) => {
        socket.join(`user_${userId}`);
        // console.log(`👤 User ${userId} joined personal room`);
      });

      // socket.on("disconnect", () => {
      //   console.log("🔴 User disconnected:", socket.id);
      // });
    });


    // Start server AFTER DB connection
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("❌ Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
