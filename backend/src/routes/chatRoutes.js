import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  sendChatMessage,
  getChatHistory,
  getUnreadCount
} from "../controllers/chatController.js";

const router = express.Router();

router.get("/unread-count", protect, getUnreadCount);
router.post("/send", protect, sendChatMessage);
router.get("/:rentalRequestId", protect, getChatHistory);


export default router;
