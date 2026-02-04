import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createRentalRequest,
  acceptRentalRequest,
  rejectRentalRequest,
  getOwnerRentalRequests,
  getRenterRentalRequests
} from "../controllers/rentalRequestController.js";

const router = express.Router();

router.post("/", protect, createRentalRequest);

router.get("/owner", protect, getOwnerRentalRequests);
router.get("/my", protect, getRenterRentalRequests);

router.patch("/:requestId/accept", protect, acceptRentalRequest);
router.patch("/:requestId/reject", protect, rejectRentalRequest);

export default router;
