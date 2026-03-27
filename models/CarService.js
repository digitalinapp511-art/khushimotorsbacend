import mongoose from "mongoose";

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

    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

carServiceSchema.index({ carServiceId: 1, createdAt: -1 });
carServiceSchema.index({ carNo: 1 });

export default mongoose.model("CarService", carServiceSchema);
