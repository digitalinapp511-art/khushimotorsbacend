import CarService from "../models/CarService.js";

export const generateBookingToken = async () => {
  console.log("🚀 generateBookingToken called!");

  // Use UTC boundaries so behaviour is identical in local and production
  const now = new Date();
  const startOfDay = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0)
  );
  const endOfDay = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999)
  );

  console.log("📅 UTC date range:", startOfDay.toISOString(), "→", endOfDay.toISOString());

  try {
    // Find the highest numeric token issued today
    const lastEntry = await CarService.findOne({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      token: { $exists: true, $ne: null },
    })
      .sort({ createdAt: -1 }) // most recent first
      .select("token")
      .lean();

    const lastToken = lastEntry ? parseInt(lastEntry.token, 10) : 0;
    const nextToken = (Number.isFinite(lastToken) ? lastToken : 0) + 1;

    console.log("✅ Last token today:", lastToken, "→ Next token:", nextToken);
    return String(nextToken);
  } catch (err) {
    console.error("❌ Token generation error:", err);
    throw err;
  }
};
