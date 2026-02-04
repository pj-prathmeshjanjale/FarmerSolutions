import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { askChatbot } from "../controllers/chatbotController.js";

const router = express.Router();

// POST /api/chatbot
router.post("/", protect, askChatbot);

export default router;
