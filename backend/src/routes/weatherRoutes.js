import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getWeatherDashboard } from "../controllers/weatherController.js";

const router = express.Router();

// Get weather dashboard data (Supports optional auth token for user profile context)
router.post(
  "/dashboard",
  getWeatherDashboard
);
router.get(
  "/dashboard",
  getWeatherDashboard
);
export default router;
