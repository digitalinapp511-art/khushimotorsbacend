import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Brand"
  },

  modelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CarModel"
  },

  servicePackageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ServicePackage"
  },

  price: {
    type: Number
  },

  status: {
    type: String,
    default: "Pending"
  }

}, { timestamps: true });

export default mongoose.model("Booking", bookingSchema);