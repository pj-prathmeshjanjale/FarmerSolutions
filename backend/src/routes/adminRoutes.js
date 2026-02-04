import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import {
  getSellers,
  updateSellerStatus,
  getProducts,
  updateProductStatus
} from "../controllers/adminController.js";

const router = express.Router();

router.use(protect);
router.use(authorizeRoles("admin"));

router.get("/dashboard", (req, res) => {
  res.json({
    success: true,
    message: "Welcome Admin",
    user: req.user
  });
});

router.get("/sellers", getSellers);
router.put("/seller-status/:id", updateSellerStatus);
router.get("/products", getProducts);
router.put("/product-status/:id", updateProductStatus);

export default router;
