import express from "express";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/", (req, res) => {
  res.json({ message: "API is working fine" });
});

router.get("/protected", protect, (req, res) => {
  res.json({
    success: true,
    message: "Protected route accessed",
    user: req.user
  });
});

export default router;
