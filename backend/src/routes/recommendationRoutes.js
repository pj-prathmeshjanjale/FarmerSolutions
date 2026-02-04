import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { getRecommendedProducts } from "../controllers/recommendationController.js";

const router = express.Router();

// Farmer-only product recommendations
router.get(
  "/products",
  protect,
  authorizeRoles("farmer"),
  getRecommendedProducts
);

export default router;
