// import TokenCounter from "../models/TokenCounter.js";

// const padSequence = (value, width = 4) => String(value).padStart(width, "0");

// export const generateBookingToken = async () => {
//   const now = new Date();
//   const year = now.getFullYear();
//   const month = String(now.getMonth() + 1).padStart(2, "0");
//   const counterKey = `KM-${year}-${month}`;

//   const counter = await TokenCounter.findOneAndUpdate(
//     { key: counterKey },
//     { $inc: { seq: 1 } },
//     { new: true, upsert: true, setDefaultsOnInsert: true }
//   );

//   return `${counterKey}-${padSequence(counter.seq)}`;
// };



import TokenCounter from "../models/TokenCounter.js";

const padSequence = (value, width = 4) => String(value).padStart(width, "0");

export const generateBookingToken = async () => {
  console.log("🚀 generateBookingToken called!"); // 👈 Add karo

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const counterKey = `KM-${year}-${month}`;

  console.log("🔑 Counter key:", counterKey); // 👈 Add karo

  try {
    const counter = await TokenCounter.findOneAndUpdate(
      { key: counterKey },
      { $inc: { seq: 1 } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    console.log("🔢 Counter:", counter); // 👈 Add karo

    const token = `${counterKey}-${padSequence(counter.seq)}`;
    console.log("✅ Token:", token); // 👈 Add karo
    return token;

  } catch (err) {
    console.error("❌ TokenCounter error:", err); // 👈 Add karo
    throw err;
  }
};