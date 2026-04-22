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
    required: false,
    trim: true,
    sparse: true,
  },

  token: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },

  customerPhone: {
    type: String,
    trim: true,
  },

  price: {
    type: Number,
    required: true,
    min: 100,
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 100,
  },
  advancePaid: {
    type: Number,
    required: true,
    min: 100,
    default: 100,
  },
  remainingAmount: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
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
// bookingSchema.index({ token: 1 }, { unique: true });
// bookingSchema.index({ paymentId: 1 }, { unique: true, sparse: true });

export default mongoose.model("Booking", bookingSchema);
