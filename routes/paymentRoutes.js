import express from "express";
import {
  verifyRazorpayPayment,
  getRazorpayKey,
  createRazorpayOrder,
  getRazorpayStatus,
} from "../controllers/paymentController.js";

const router = express.Router();

// Get Razorpay configuration status
router.get("/status", getRazorpayStatus);

// Get Razorpay key for frontend
router.get("/razorpay-key", getRazorpayKey);

// Verify Razorpay payment
router.post("/verify", verifyRazorpayPayment);

// Create Razorpay order (optional - for server-side order creation)
router.post("/create-order", createRazorpayOrder);

export default router;
