import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { addLand, getMyLands } from "../controllers/landController.js";

const router = express.Router();

/*
  Only farmers can add land
*/
router.post(
  "/",
  protect,
  authorizeRoles("farmer"),
  addLand
);

/*
  Only farmers can view their lands
*/
router.get(
  "/",
  protect,
  authorizeRoles("farmer"),
  getMyLands
);

export default router;
