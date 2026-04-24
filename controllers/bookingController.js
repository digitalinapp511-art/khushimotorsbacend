// // controllers/bookingController.js
// import Booking from "../models/Booking.js";
// import User from "../models/User.js";
// import { generateBookingToken } from "../services/tokenService.js";

// const BOOKING_TOKEN_MAX_RETRY = 5;

// const normalizePhone = (value) => String(value || "").replace(/\D/g, "").slice(-10);

// // ✅ SIRF EK BAAR - logs ke saath
// const createBookingWithToken = async (bookingData) => {
//   let retries = 0;

//   while (retries < BOOKING_TOKEN_MAX_RETRY) {
//     try {
//       const token = await generateBookingToken();
//       console.log("💾 Saving booking with token:", token);
//       return await Booking.create({ ...bookingData, token });
//     } catch (error) {
//       console.error("❌ Booking create error:", error);
//       if (error?.code === 11000 && error?.keyPattern?.token) {
//         retries += 1;
//         continue;
//       }
//       throw error;
//     }
//   }

//   throw new Error("Could not generate a unique booking token");
// };

// // baaki saara code same rehega...


// /**
//  * USER - Create Booking (after successful payment)
//  *
//  * Expected body:
//  * {
//  *   brandId: string (ObjectId),
//  *   modelId: string (ObjectId),
//  *   servicePackageId: string (ObjectId),
//  *   price: number,            // amount paid in INR
//  *   paymentId: string         // payment gateway transaction id
//  * }
//  */
// export const createBooking = async (req, res) => {
//   try {
//     const userId = req.user?._id;
//     const {
//       brandId,
//       modelId,
//       servicePackageId,
//       price,
//       totalAmount,
//       paymentId,
//       customerPhone,
//     } = req.body;

//     // Basic validations
//     if (
//       !userId ||
//       !brandId ||
//       !modelId ||
//       !servicePackageId
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing required booking details",
//       });
//     }

//     const resolvedTotalAmount = Number(totalAmount ?? price);
//     if (Number.isNaN(resolvedTotalAmount)) {
//       return res.status(400).json({
//         success: false,
//         message: "Total amount must be a valid number",
//       });
//     }

//     if (resolvedTotalAmount < 100) {
//       return res.status(400).json({
//         success: false,
//         message: "Minimum total amount is 100 INR",
//       });
//     }

//     // Ensure we have a payment id from payment gateway
//     if (!paymentId) {
//       return res.status(400).json({
//         success: false,
//         message: "PaymentId is required to confirm booking",
//       });
//     }

//     // At this point you would typically verify paymentId with your payment gateway (Razorpay/Stripe/etc.)
//     // For example:
//     // const isPaymentValid = await verifyPaymentWithGateway(paymentId, price);
//     // if (!isPaymentValid) { ... }

//     const advancePaid = 100;
//     const remainingAmount = Math.max(resolvedTotalAmount - advancePaid, 0);

//     // Create booking with status "Confirmed"
//     const normalizedCustomerPhone = normalizePhone(
//       customerPhone || req.user?.mobile
//     );

//     const booking = await createBookingWithToken({
//       userId,
//       brandId,
//       modelId,
//       servicePackageId,
//       paymentId: String(paymentId).trim(),
//       customerPhone: normalizedCustomerPhone || undefined,
//       // Keep `price` as total amount for backward-compatible UIs.
//       price: resolvedTotalAmount,
//       totalAmount: resolvedTotalAmount,
//       advancePaid,
//       remainingAmount,
//       // status: "Confirmed", // override default "Pending" on successful payment
//     });

//     const populatedBooking = await Booking.findById(booking._id)
//       .populate("brandId")
//       .populate("modelId")
//       .populate("servicePackageId");

//     return res.status(201).json({
//       success: true,
//       message: "Service booked successfully",
//       booking: populatedBooking,
//     });
//   } catch (error) {
//     console.error("Create booking error:", error);

//     if (error?.code === 11000 && error?.keyPattern?.paymentId) {
//       return res.status(409).json({
//         success: false,
//         message: "Duplicate paymentId detected",
//       });
//     }

//     return res.status(500).json({
//       success: false,
//       message: "Failed to create booking",
//     });
//   }
// };



// /**
//  * ADMIN - Create offline booking
//  */
// export const createOfflineBooking = async (req, res) => {
//   try {
//     const {
//       userId,
//       customerPhone,
//       brandId,
//       modelId,
//       servicePackageId,
//       totalAmount,
//       price,
//       advancePaid,
//     } = req.body;

//     if (!brandId || !modelId || !servicePackageId) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing required booking details",
//       });
//     }

//     const resolvedTotalAmount = Number(totalAmount ?? price);
//     if (Number.isNaN(resolvedTotalAmount) || resolvedTotalAmount < 100) {
//       return res.status(400).json({
//         success: false,
//         message: "Minimum total amount is 100 INR",
//       });
//     }

//     let resolvedUserId = userId;
//     const normalizedPhone = normalizePhone(customerPhone);
//     if (!resolvedUserId) {
//       if (!normalizedPhone) {
//         return res.status(400).json({
//           success: false,
//           message: "userId or customerPhone is required for offline booking",
//         });
//       }

//       let user = await User.findOne({ mobile: normalizedPhone });
//       if (!user) {
//         user = await User.create({ mobile: normalizedPhone });
//       }
//       resolvedUserId = user._id;
//     }

//     const resolvedAdvancePaid =
//       Number.isFinite(Number(advancePaid)) && Number(advancePaid) >= 0
//         ? Number(advancePaid)
//         : 0;
//     const remainingAmount = Math.max(resolvedTotalAmount - resolvedAdvancePaid, 0);

//     const booking = await createBookingWithToken({
//       userId: resolvedUserId,
//       brandId,
//       modelId,
//       servicePackageId,
//       paymentId: undefined,
//       customerPhone: normalizedPhone || undefined,
//       price: resolvedTotalAmount,
//       totalAmount: resolvedTotalAmount,
//       advancePaid: resolvedAdvancePaid,
//       remainingAmount,
//       status: "Confirmed",
//     });

//     const populatedBooking = await Booking.findById(booking._id)
//       .populate("brandId")
//       .populate("modelId")
//       .populate("servicePackageId");

//     return res.status(201).json({
//       success: true,
//       message: "Offline booking created successfully",
//       booking: populatedBooking,
//     });
//   } catch (error) {
//     console.error("Create offline booking error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to create offline booking",
//     });
//   }
// };

// /**
//  * USER - Get all bookings for logged-in user
//  * Assumes you attach `req.user.id` from auth middleware.
//  */
// export const getMyBookings = async (req, res) => {
//   try {
//     const userId = req.user?.id || req.userId || req.body.userId;

//     if (!userId) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized",
//       });
//     }

//     const bookings = await Booking.find({ userId })
//       .populate("brandId")
//       .populate("modelId")
//       .populate("servicePackageId")
//       .sort({ createdAt: -1 });

//     return res.json({
//       success: true,
//       bookings,
//     });
//   } catch (error) {
//     console.error("Get user bookings error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch bookings",
//     });
//   }
// };

// /**
//  * ADMIN - Get all bookings
//  */
// export const getAllBookings = async (req, res) => {
//   try {
//     const bookings = await Booking.find()
//       .populate("userId")
//       .populate("brandId")
//       .populate("modelId")
//       .populate("servicePackageId")
//       .sort({ createdAt: -1 });

//     return res.json({
//       success: true,
//       bookings,
//     });
//   } catch (error) {
//     console.error("Get all bookings error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch bookings",
//     });
//   }
// };

// /**
//  * ADMIN - Update booking status (e.g., Confirmed, In-Progress, Completed, Cancelled)
//  */
// export const updateBookingStatus = async (req, res) => {
//   try {
//     const { status } = req.body;

//     if (!status) {
//       return res.status(400).json({
//         success: false,
//         message: "Status is required",
//       });
//     }

//     const booking = await Booking.findByIdAndUpdate(
//       req.params.id,
//       { status },
//       { new: true }
//     );

//     if (!booking) {
//       return res.status(404).json({
//         success: false,
//         message: "Booking not found",
//       });
//     }

//     return res.json({
//       success: true,
//       message: "Booking status updated",
//       booking,
//     });
//   } catch (error) {
//     console.error("Update booking status error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to update booking status",
//     });
//   }
// };

// /**
//  * ADMIN - Mark payment received
//  */
// export const confirmBookingPayment = async (req, res) => {
//   try {
//     const { paymentId, amountPaid } = req.body;

//     if (!String(paymentId || "").trim()) {
//       return res.status(400).json({
//         success: false,
//         message: "paymentId is required",
//       });
//     }

//     const booking = await Booking.findById(req.params.id);
//     if (!booking) {
//       return res.status(404).json({
//         success: false,
//         message: "Booking not found",
//       });
//     }

//     if (booking.paymentId && booking.paymentId !== String(paymentId).trim()) {
//       return res.status(409).json({
//         success: false,
//         message: "This booking already has a different paymentId",
//       });
//     }

//     const paid = Number(amountPaid);
//     const safeAmountPaid = Number.isFinite(paid) && paid > 0 ? paid : booking.advancePaid;
//     booking.paymentId = String(paymentId).trim();
//     booking.advancePaid = safeAmountPaid;
//     booking.remainingAmount = Math.max(booking.totalAmount - safeAmountPaid, 0);
//     await booking.save();

//     const populatedBooking = await Booking.findById(booking._id)
//       .populate("brandId")
//       .populate("modelId")
//       .populate("servicePackageId");

//     return res.json({
//       success: true,
//       message: "Payment confirmed successfully",
//       booking: populatedBooking,
//     });
//   } catch (error) {
//     console.error("Confirm booking payment error:", error);

//     if (error?.code === 11000 && error?.keyPattern?.paymentId) {
//       return res.status(409).json({
//         success: false,
//         message: "Duplicate paymentId detected",
//       });
//     }

//     return res.status(500).json({
//       success: false,
//       message: "Failed to confirm payment",
//     });
//   }
// };

// /**
//  * ADMIN - Delete booking
//  */
// export const deleteBooking = async (req, res) => {
//   try {
//     const booking = await Booking.findByIdAndDelete(req.params.id);

//     if (!booking) {
//       return res.status(404).json({
//         success: false,
//         message: "Booking not found",
//       });
//     }

//     return res.json({
//       success: true,
//       message: "Booking deleted successfully",
//     });
//   } catch (error) {
//     console.error("Delete booking error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to delete booking",
//     });
//   }
// };





// controllers/bookingController.js
import Booking from "../models/Booking.js";
import User from "../models/User.js";
import { generateBookingToken } from "../services/tokenService.js";
import { processBookingToken } from "../utils/serviceTypeChecker.js";

const BOOKING_TOKEN_MAX_RETRY = 5;

const normalizePhone = (value) => String(value || "").replace(/\D/g, "").slice(-10);

// ✅ Enhanced booking creation with car service token checking
const createBookingWithToken = async (bookingData) => {
  let retries = 0;
  console.log("📦 createBookingWithToken called!");

  // Process token based on service type
  const processedBookingData = await processBookingToken(bookingData);
  
  // If no token needed (car service), create booking directly
  if (!processedBookingData.token) {
    console.log("🚗 Creating car service booking without token");
    return await Booking.create(processedBookingData);
  }

  // For regular services, generate token with retry logic
  while (retries < BOOKING_TOKEN_MAX_RETRY) {
    try {
      const token = await generateBookingToken();
      console.log("💾 Saving booking with token:", token);
      return await Booking.create({ ...processedBookingData, token });
    } catch (error) {
      console.error("❌ Booking create error:", error);
      if (error?.code === 11000 && error?.keyPattern?.token) {
        retries += 1;
        continue;
      }
      throw error;
    }
  }

  throw new Error("Could not generate a unique booking token");
};

/**
 * USER - Create Booking (after successful payment)
 */
export const createBooking = async (req, res) => {
  console.log("🎯 createBooking HIT!"); // ✅ LOG
  console.log("📋 Body:", req.body);    // ✅ LOG

  try {
    const userId = req.user?._id;
    console.log("👤 userId:", userId);  // ✅ LOG

    const {
      brandId,
      modelId,
      servicePackageId,
      price,
      totalAmount,
      paymentId,
      customerPhone,
    } = req.body;

    if (!userId || !brandId || !modelId || !servicePackageId) {
      console.log("❌ Validation failed - missing fields");
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

    // paymentId is strongly recommended but not hard-blocked here because
    // Razorpay's handler fires only after a successful charge; the payment ID
    // may be empty in test/sandbox flows or if the gateway omits it.
    // We still store whatever value arrives so it can be reconciled later.

    const advancePaid = 100;
    const remainingAmount = Math.max(resolvedTotalAmount - advancePaid, 0);

    const normalizedCustomerPhone = normalizePhone(
      customerPhone || req.user?.mobile
    );

    console.log("✅ All validations passed, creating booking..."); // ✅ LOG

    const booking = await createBookingWithToken({
      userId,
      brandId,
      modelId,
      servicePackageId,
      paymentId: paymentId ? String(paymentId).trim() : undefined,
      customerPhone: normalizedCustomerPhone || undefined,
      price: resolvedTotalAmount,
      totalAmount: resolvedTotalAmount,
      advancePaid,
      remainingAmount,
    });

    console.log("🎉 Booking created! Token:", booking.token); // ✅ LOG

    const populatedBooking = await Booking.findById(booking._id)
      .populate("brandId")
      .populate("modelId")
      .populate("servicePackageId");

    return res.status(201).json({
      success: true,
      message: "Service booked successfully",
      booking: populatedBooking,
    });
  } catch (error) {
    console.error("Create booking error:", error);

    if (error?.code === 11000 && error?.keyPattern?.paymentId) {
      return res.status(409).json({
        success: false,
        message: "Duplicate paymentId detected",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create booking",
    });
  }
};

/**
 * ADMIN - Create offline booking
 */
export const createOfflineBooking = async (req, res) => {
  console.log("🎯 createOfflineBooking HIT!"); // ✅ LOG
  console.log("📋 Body:", req.body);

  try {
    const {
      userId,
      customerPhone,
      brandId,
      modelId,
      servicePackageId,
      totalAmount,
      price,
      advancePaid,
    } = req.body;

    if (!brandId || !modelId || !servicePackageId) {
      return res.status(400).json({
        success: false,
        message: "Missing required booking details",
      });
    }

    const resolvedTotalAmount = Number(totalAmount ?? price);
    if (Number.isNaN(resolvedTotalAmount) || resolvedTotalAmount < 100) {
      return res.status(400).json({
        success: false,
        message: "Minimum total amount is 100 INR",
      });
    }

    let resolvedUserId = userId;
    const normalizedPhone = normalizePhone(customerPhone);
    if (!resolvedUserId) {
      if (!normalizedPhone) {
        return res.status(400).json({
          success: false,
          message: "userId or customerPhone is required for offline booking",
        });
      }

      let user = await User.findOne({ mobile: normalizedPhone });
      if (!user) {
        user = await User.create({ mobile: normalizedPhone });
      }
      resolvedUserId = user._id;
    }

    const resolvedAdvancePaid =
      Number.isFinite(Number(advancePaid)) && Number(advancePaid) >= 0
        ? Number(advancePaid)
        : 0;
    const remainingAmount = Math.max(resolvedTotalAmount - resolvedAdvancePaid, 0);

    const booking = await createBookingWithToken({
      userId: resolvedUserId,
      brandId,
      modelId,
      servicePackageId,
      paymentId: undefined,
      customerPhone: normalizedPhone || undefined,
      price: resolvedTotalAmount,
      totalAmount: resolvedTotalAmount,
      advancePaid: resolvedAdvancePaid,
      remainingAmount,
      status: "Confirmed",
    });

    console.log("🎉 Offline booking created! Token:", booking.token); // ✅ LOG

    const populatedBooking = await Booking.findById(booking._id)
      .populate("brandId")
      .populate("modelId")
      .populate("servicePackageId");

    return res.status(201).json({
      success: true,
      message: "Offline booking created successfully",
      booking: populatedBooking,
    });
  } catch (error) {
    console.error("Create offline booking error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create offline booking",
    });
  }
};

/**
 * USER - Get all bookings for logged-in user
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
 * ADMIN - Update booking status
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
 * ADMIN - Mark payment received
 */
export const confirmBookingPayment = async (req, res) => {
  try {
    const { paymentId, amountPaid } = req.body;

    if (!String(paymentId || "").trim()) {
      return res.status(400).json({
        success: false,
        message: "paymentId is required",
      });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.paymentId && booking.paymentId !== String(paymentId).trim()) {
      return res.status(409).json({
        success: false,
        message: "This booking already has a different paymentId",
      });
    }

    const paid = Number(amountPaid);
    const safeAmountPaid = Number.isFinite(paid) && paid > 0 ? paid : booking.advancePaid;
    booking.paymentId = String(paymentId).trim();
    booking.advancePaid = safeAmountPaid;
    booking.remainingAmount = Math.max(booking.totalAmount - safeAmountPaid, 0);
    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate("brandId")
      .populate("modelId")
      .populate("servicePackageId");

    return res.json({
      success: true,
      message: "Payment confirmed successfully",
      booking: populatedBooking,
    });
  } catch (error) {
    console.error("Confirm booking payment error:", error);

    if (error?.code === 11000 && error?.keyPattern?.paymentId) {
      return res.status(409).json({
        success: false,
        message: "Duplicate paymentId detected",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to confirm payment",
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