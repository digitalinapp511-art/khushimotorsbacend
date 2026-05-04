import Booking from "../models/Booking.js";

export const generateBookingToken = async () => {
  console.log("🚀 generateBookingToken called!");

  // Build start and end of today (midnight to midnight)
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfDay   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  console.log("� Date range:", startOfDay, "→", endOfDay);

  try {
    const todayCount = await Booking.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    const token = String(todayCount + 1);
    console.log("✅ Token:", token, "(today's bookings so far:", todayCount, ")");
    return token;
  } catch (err) {
    console.error("❌ Token generation error:", err);
    throw err;
  }
};
