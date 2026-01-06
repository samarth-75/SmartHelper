import express from "express";
import { createPayment, getFamilyPayments } from "../controllers/paymentsController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, createPayment);
router.get("/family", protect, getFamilyPayments);

export default router;
