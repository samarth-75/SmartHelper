import express from "express";
import { uploadAvatar, uploadMiddleware } from "../controllers/uploadController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Upload avatar route
router.post("/avatar", protect, uploadMiddleware, uploadAvatar);

export default router;
