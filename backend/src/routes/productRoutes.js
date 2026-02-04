import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import {
  addProduct,
  approveProduct,
  getApprovedProducts,
  getMyProducts
} from "../controllers/productController.js";

import productUpload from "../middleware/productUploadMiddleware.js";

const router = express.Router();

// Seller views their own products
router.get("/my", protect, authorizeRoles("seller"), getMyProducts);

// Seller adds product
router.post(
  "/",
  protect,
  authorizeRoles("seller"),
  productUpload.array("images", 5), // Max 5 images
  addProduct
);

// Admin approves product
router.put(
  "/approve/:id",
  protect,
  authorizeRoles("admin"),
  approveProduct
);

// View products (available to all roles)
router.get(
  "/",
  protect,
  getApprovedProducts
);

export default router;
