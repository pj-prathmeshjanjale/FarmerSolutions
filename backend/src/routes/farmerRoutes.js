import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { getFarmerProfileController, createOrUpdateFarmerProfile } from "../controllers/farmerController.js";

const router = express.Router();

router.get(
  "/profile",
  protect,
  authorizeRoles("farmer", "admin"), // allow admin if needed per requirements
  getFarmerProfileController
);

router.post(
  "/profile",
  protect,                 
  authorizeRoles("farmer", "admin"),
  createOrUpdateFarmerProfile
);

export default router;
