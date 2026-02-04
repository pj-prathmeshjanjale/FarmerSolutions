import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createRentOrder } from "../controllers/rentOrderController.js";

const router = express.Router();

// Create rent order
router.post("/", protect, createRentOrder);

export default router;
