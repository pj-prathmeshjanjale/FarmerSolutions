import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { 
  submitCommunityPrice, 
  getCommunityPrices,
  deleteCommunityPrice
} from "../controllers/communityPriceController.js";

const router = express.Router();

router.get("/", getCommunityPrices);
router.post("/", protect, submitCommunityPrice);
router.delete("/:id", protect, deleteCommunityPrice);

export default router;
