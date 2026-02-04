import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import {
  createPaymentOrder,
  verifyPayment,
  createConnectedAccount
} from "../controllers/paymentController.js";

const router = express.Router();

// Seller Onboarding
router.post(
  "/onboard",
  protect,
  authorizeRoles("farmer", "seller"),
  createConnectedAccount
);

// Allow all roles to pay
router.post(
  "/create",
  protect,
  authorizeRoles("farmer", "seller", "admin", "buyer"),
  createPaymentOrder
);

router.post(
  "/verify",
  protect,
  authorizeRoles("farmer", "seller", "admin", "buyer"),
  verifyPayment
);

export default router;
