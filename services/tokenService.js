import TokenCounter from "../models/TokenCounter.js";

const TOKEN_KEY = "BOOKING_TOKEN";
const TOKEN_MAX = 20;

export const generateBookingToken = async () => {
  console.log("🚀 generateBookingToken called!");

  try {
    // Atomically increment the counter
    const counter = await TokenCounter.findOneAndUpdate(
      { key: TOKEN_KEY },
      { $inc: { seq: 1 } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    console.log("🔢 Counter after increment:", counter.seq);

    // Wrap around: compute token in range 1–20
    const token = ((counter.seq - 1) % TOKEN_MAX) + 1;

    console.log("✅ Token:", token);
    return String(token);
  } catch (err) {
    console.error("❌ TokenCounter error:", err);
    throw err;
  }
};