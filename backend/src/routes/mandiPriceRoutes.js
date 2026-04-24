import express from "express";
import { protect, isAdmin } from "../middleware/authMiddleware.js";
import { 
  getMandiPrices, 
  getMandiTrends, 
  getBestMandi, 
  compareMandis, 
  getAIRecommendation, 
  getSystemStatus 
} from "../controllers/mandiPriceController.js";
import { runScraperPipeline } from "../jobs/mandiCron.js";

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

// Admin-only: manually trigger the scraper pipeline
router.post("/trigger-scraper", protect, isAdmin, async (req, res) => {
  try {
    res.json({ success: true, message: "Scraper pipeline started in background..." });
    // Run after response so client is not left waiting
    runScraperPipeline();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
