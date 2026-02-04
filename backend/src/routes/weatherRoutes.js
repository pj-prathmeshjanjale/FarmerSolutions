import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getCurrentWeather } from "../controllers/weatherController.js";

const router = express.Router();

// Get current weather (city or land fallback)
router.post(
  "/current",
  getCurrentWeather
);

export default router;
