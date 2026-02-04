import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getMandiPrices } from "../controllers/mandiPriceController.js";

const router = express.Router();

// Get cached mandi prices (farmer-facing)
router.get(
  "/",
  getMandiPrices
);

export default router;
