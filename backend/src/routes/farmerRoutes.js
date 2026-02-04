import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { createOrUpdateFarmerProfile } from "../controllers/farmerController.js";

const router = express.Router();

/*
  Only LOGGED-IN users AND role = farmer
*/
router.post(
  "/profile",
  protect,                 // 1️⃣ must be logged in
  authorizeRoles("farmer"),// 2️⃣ must be farmer
  createOrUpdateFarmerProfile
);

export default router;
