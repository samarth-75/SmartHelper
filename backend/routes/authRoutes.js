import express from "express";
import { register, login } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";


const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", protect, (req, res) => {
  res.json(req.user);
});

export default router;
