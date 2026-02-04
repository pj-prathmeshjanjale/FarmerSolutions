import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import {
  applyForSeller,
  approveSeller,
  getSellerProfile
} from "../controllers/sellerController.js";

const router = express.Router();

// Get current seller profile
router.get("/profile", protect, getSellerProfile);

// User applies to become seller
router.post(
  "/apply",
  protect,
  authorizeRoles("farmer", "buyer"),
  applyForSeller
);

// Admin approves seller
router.put(
  "/approve/:id",
  protect,
  authorizeRoles("admin"),
  approveSeller
);

export default router;
