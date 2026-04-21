// controllers/bookingController.js
import Booking from "../models/Booking.js";

/**
 * USER - Create Booking (after successful payment)
 *
 * Expected body:
 * {
 *   brandId: string (ObjectId),
 *   modelId: string (ObjectId),
 *   servicePackageId: string (ObjectId),
 *   price: number,            // amount paid in INR
 *   paymentId: string         // payment gateway transaction id
 * }
 */
export const createBooking = async (req, res) => {
  try {
    const userId = req.user?._id;
    const {
      brandId,
      modelId,
      servicePackageId,
      price,
      totalAmount,
      paymentId,
    } = req.body;

    // Basic validations
    if (
      !userId ||
      !brandId ||
      !modelId ||
      !servicePackageId
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required booking details",
      });
    }

    const resolvedTotalAmount = Number(totalAmount ?? price);
    if (Number.isNaN(resolvedTotalAmount)) {
      return res.status(400).json({
        success: false,
        message: "Total amount must be a valid number",
      });
    }

    if (resolvedTotalAmount < 100) {
      return res.status(400).json({
        success: false,
        message: "Minimum total amount is 100 INR",
      });
    }

    // Ensure we have a payment id from payment gateway
    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: "PaymentId is required to confirm booking",
      });
    }

    // At this point you would typically verify paymentId with your payment gateway (Razorpay/Stripe/etc.)
    // For example:
    // const isPaymentValid = await verifyPaymentWithGateway(paymentId, price);
    // if (!isPaymentValid) { ... }

    const advancePaid = 100;
    const remainingAmount = Math.max(resolvedTotalAmount - advancePaid, 0);

    // Create booking with status "Confirmed"
    const booking = await Booking.create({
      userId,
      brandId,
      modelId,
      servicePackageId,
      paymentId,
      // Keep `price` as total amount for backward-compatible UIs.
      price: resolvedTotalAmount,
      totalAmount: resolvedTotalAmount,
      advancePaid,
      remainingAmount,
      // status: "Confirmed", // override default "Pending" on successful payment
    });

    return res.status(201).json({
      success: true,
      message: "Service booked successfully",
      booking,
    });
  } catch (error) {
    console.error("Create booking error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create booking",
    });
  }
};

/**
 * USER - Get all bookings for logged-in user
 * Assumes you attach `req.user.id` from auth middleware.
 */
export const getMyBookings = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId || req.body.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const bookings = await Booking.find({ userId })
      .populate("brandId")
      .populate("modelId")
      .populate("servicePackageId")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error("Get user bookings error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
    });
  }
};

/**
 * ADMIN - Get all bookings
 */
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("userId")
      .populate("brandId")
      .populate("modelId")
      .populate("servicePackageId")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error("Get all bookings error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
    });
  }
};

/**
 * ADMIN - Update booking status (e.g., Confirmed, In-Progress, Completed, Cancelled)
 */
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    return res.json({
      success: true,
      message: "Booking status updated",
      booking,
    });
  } catch (error) {
    console.error("Update booking status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update booking status",
    });
  }
};

/**
 * ADMIN - Delete booking
 */
export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    return res.json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    console.error("Delete booking error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete booking",
    });
  }
};
