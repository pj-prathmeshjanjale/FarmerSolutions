import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

import {
   createEquipment,
   getAllEquipment,
   getEquipmentById,
   getMyEquipment,
   deleteEquipment
} from "../controllers/equipmentController.js";

const router = express.Router();

/* =========================
   OWNER ROUTES
========================= */

// Logged-in farmer → his own equipment
router.get("/my", protect, getMyEquipment);

// Logged-in farmer → create equipment
router.post("/", protect, upload.array("images", 5), createEquipment);

// Logged-in farmer → delete equipment
router.delete("/:id", protect, deleteEquipment);

/* =========================
   PUBLIC / RENTER ROUTES
========================= */

// View all available equipment
router.get("/", getAllEquipment);

// View single equipment details
router.get("/:id", getEquipmentById);

export default router;
