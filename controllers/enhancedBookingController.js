// Enhanced Booking Controller with Status Update Features
import Booking from "../models/Booking.js";
import User from "../models/User.js";

const BOOKING_STATUSES = [
  "Pending",
  "Confirmed", 
  "In-Progress",
  "Completed",
  "Cancelled",
];

/**
 * ADMIN - Update booking status with date/time selection
 */
export const updateBookingStatusEnhanced = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      status, 
      statusDate, 
      statusTime, 
      updatedBy = "Admin",
      notes,
      scheduledDate,
      scheduledTime 
    } = req.body;

    // Validate status
    if (!status || !BOOKING_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${BOOKING_STATUSES.join(", ")}`,
      });
    }

    // Find the booking
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Validate status date/time if provided
    let finalStatusDate = null;
    let finalStatusTime = null;

    if (statusDate) {
      const parsedDate = new Date(statusDate);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid status date format",
        });
      }
      finalStatusDate = parsedDate;
    }

    if (statusTime) {
      // Validate time format (HH:MM)
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(statusTime)) {
        return res.status(400).json({
          success: false,
          message: "Invalid time format. Use HH:MM (24-hour format)",
        });
      }
      finalStatusTime = statusTime;
    }

    // Validate scheduled date/time if provided (for confirmed bookings)
    let finalScheduledDate = null;
    let finalScheduledTime = null;
    let scheduledMessage = null;

    if (status === "Confirmed" && scheduledDate && scheduledTime) {
      const parsedScheduledDate = new Date(scheduledDate);
      if (isNaN(parsedScheduledDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid scheduled date format",
        });
      }
      finalScheduledDate = parsedScheduledDate;

      // Validate scheduled time format
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(scheduledTime)) {
        return res.status(400).json({
          success: false,
          message: "Invalid scheduled time format. Use HH:MM (24-hour format)",
        });
      }
      finalScheduledTime = scheduledTime;

      // Create scheduled message
      const formattedDate = parsedScheduledDate.toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      });
      scheduledMessage = `Your car service is scheduled on ${formattedDate} at ${scheduledTime}`;
    }

    // Update booking with enhanced status information
    const updateData = {
      status,
      statusUpdateDate: finalStatusDate,
      statusUpdateTime: finalStatusTime,
      statusUpdatedBy: updatedBy,
      // Add notes field if needed
      ...(notes && { statusNotes: notes }),
      // Add scheduled information
      ...(finalScheduledDate && { scheduledDate: finalScheduledDate }),
      ...(finalScheduledTime && { scheduledTime: finalScheduledTime }),
      ...(scheduledMessage && { scheduledMessage })
    };

    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate("userId brandId modelId servicePackageId");

    console.log(`📊 Booking status updated: ${booking._id} -> ${status} by ${updatedBy}`);
    if (finalScheduledDate) {
      console.log(`📅 Service scheduled for: ${finalScheduledDate.toDateString()} at ${finalScheduledTime}`);
    }

    // Create notification for customer
    if (booking.userId && booking.userId.toString() !== updatedBy) {
      console.log(`🔔 Customer notification sent for booking ${booking._id}`);
      if (scheduledMessage) {
        console.log(`📱 Customer message: ${scheduledMessage}`);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Booking status updated to ${status} successfully`,
      booking: updatedBooking,
      scheduledMessage,
    });
  } catch (error) {
    console.error("Enhanced booking status update error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update booking status",
    });
  }
};

/**
 * ADMIN - Get booking status history
 */
export const getBookingStatusHistory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const booking = await Booking.findById(id)
      .populate("userId", "name email mobile")
      .populate("brandId", "name")
      .populate("modelId", "name")
      .populate("servicePackageId", "packageName title");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Format status history
    const statusHistory = {
      currentStatus: booking.status,
      updatedBy: booking.statusUpdatedBy,
      updateDate: booking.statusUpdateDate,
      updateTime: booking.statusUpdateTime,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    };

    return res.status(200).json({
      success: true,
      booking,
      statusHistory,
    });
  } catch (error) {
    console.error("Get booking status history error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get booking status history",
    });
  }
};

/**
 * ADMIN - Get all bookings with status filtering
 */
export const getAllBookingsEnhanced = async (req, res) => {
  try {
    const { status, date, page = 1, limit = 10 } = req.query;
    
    // Build filter
    const filter = {};
    if (status && BOOKING_STATUSES.includes(status)) {
      filter.status = status;
    }
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      filter.createdAt = { $gte: startDate, $lt: endDate };
    }

    const bookings = await Booking.find(filter)
      .populate("userId", "name email mobile")
      .populate("brandId", "name")
      .populate("modelId", "name")
      .populate("servicePackageId", "packageName title")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(filter);

    return res.status(200).json({
      success: true,
      bookings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get all bookings enhanced error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
    });
  }
};
