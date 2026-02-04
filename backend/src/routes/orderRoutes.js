import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import {
  placeOrder,
  getMyOrders,
  getSellerOrders,
  updateOrderStatus,
  getAllOrders,
  cancelOrder
} from "../controllers/orderController.js";

const router = express.Router();

// User cancels order
router.put(
  "/:id/cancel",
  protect,
  authorizeRoles("farmer", "seller", "admin", "buyer"),
  cancelOrder
);

// Farmer/All places order
router.post(
  "/",
  protect,
  authorizeRoles("farmer", "seller", "admin", "buyer"),
  placeOrder
);

// Farmer/All views own orders
router.get(
  "/my",
  protect,
  authorizeRoles("farmer", "seller", "admin", "buyer"),
  getMyOrders
);

// Seller views orders
router.get(
  "/seller",
  protect,
  authorizeRoles("seller"),
  getSellerOrders
);

// Seller updates order status
router.put(
  "/:id/status",
  protect,
  authorizeRoles("seller"),
  updateOrderStatus
);

// Admin views all orders
router.get(
  "/admin",
  protect,
  authorizeRoles("admin"),
  getAllOrders
);

export default router;
