import mongoose from "mongoose";

const BOOKING_STATUSES = [
  "Pending",
  "Confirmed",
  "In-Progress",
  "Completed",
  "Cancelled",
];

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },

  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Brand",
    required: true,
  },

  modelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CarModel",
    required: true,
  },

  servicePackageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ServicePackage",
    required: true,
  },

  paymentId: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },

  price: {
    type: Number,
    required: true,
    min: 100,
  },

  status: {
    type: String,
    enum: BOOKING_STATUSES,
    default: "Pending",
    index: true,
  },
}, { timestamps: true });

bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("Booking", bookingSchema);
