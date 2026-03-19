// routes/bookingRoutes.js
import express from "express";
import {isAdmin} from "../middleware/adminAuth.js";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  createBooking,
  getMyBookings,
  getAllBookings,
  updateBookingStatus,
  deleteBooking,
} from "../controllers/bookingController.js";

const router = express.Router();

// User routes
router.post("/", authMiddleware, createBooking);
router.get("/me", authMiddleware, getMyBookings);

// Admin routes
router.get("/", isAdmin, getAllBookings);
router.patch("/:id/status", isAdmin, updateBookingStatus);
router.delete("/:id", isAdmin, deleteBooking);

export default router;
