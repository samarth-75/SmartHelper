import express from "express";
import { createPayment, getFamilyPayments, getHelperPayments, receivePayment } from "../controllers/paymentsController.js"; 
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, createPayment);
router.get("/family", protect, getFamilyPayments);
router.get("/helper", protect, getHelperPayments);
router.post("/:id/receive", protect, receivePayment);

export default router;
