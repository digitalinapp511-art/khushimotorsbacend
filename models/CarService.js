import mongoose from "mongoose";

const OFFLINE_FREE_SERVICE_TYPES = [
  "TOP",
  "FULL",
  "RUBBING",
  "POLISHING",
  "SERVICE",
  "DP",
  "FREE",
];

const carServiceSchema = new mongoose.Schema(
  {
    carServiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
      index: true,
    },

    carNo: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    brandModel: {
      type: String,
      required: true,
      trim: true,
    },

    userName: {
      type: String,
      required: true,
      trim: true,
    },

    mobileNo: {
      type: String,
      required: true,
      trim: true,
    },

    token: {
      type: String,
      trim: true,
    },

    price: {
      type: Number,
      min: 0,
    },

    offlineFreeType: {
      type: String,
      enum: OFFLINE_FREE_SERVICE_TYPES,
      uppercase: true,
      trim: true,
    },
  },
  { timestamps: true }
);

carServiceSchema.pre("validate", function (next) {
  const hasPrice = this.price !== undefined && this.price !== null;
  const hasOfflineType = Boolean(this.offlineFreeType);

  if (!hasPrice && !hasOfflineType) {
    return next(
      new Error("Either price or offlineFreeType is required")
    );
  }

  next;
});

carServiceSchema.index({ carServiceId: 1, createdAt: -1 });
carServiceSchema.index({ carNo: 1 });

export default mongoose.model("CarService", carServiceSchema);
