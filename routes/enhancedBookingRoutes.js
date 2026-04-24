import express from "express";
import {
  updateBookingStatusEnhanced,
  getBookingStatusHistory,
  getAllBookingsEnhanced,
} from "../controllers/enhancedBookingController.js";

const router = express.Router();

// Enhanced booking status update with date/time selection
router.put("/:id/status", updateBookingStatusEnhanced);

// Get booking status history
router.get("/:id/status-history", getBookingStatusHistory);

// Get all bookings with enhanced filtering
router.get("/", getAllBookingsEnhanced);

export default router;
