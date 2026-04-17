import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { 
  getMandiPrices, 
  getMandiTrends, 
  getBestMandi, 
  compareMandis, 
  getAIRecommendation, 
  getSystemStatus 
} from "../controllers/mandiPriceController.js";

const router = express.Router();

// Publicly readable endpoints (or optionally protect them depending on business needs)
// Keeping basic reads public for better accessibility, AI logic is protected.
router.get("/", getMandiPrices);
router.get("/trends", getMandiTrends);
router.get("/best", getBestMandi);
router.post("/compare", compareMandis); // using POST because of array body
router.get("/status", getSystemStatus);

// Protected endpoints (require user context)
router.get("/ai-recommend", protect, getAIRecommendation);

export default router;
