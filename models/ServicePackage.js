import mongoose from "mongoose";

const servicePackageSchema = new mongoose.Schema({

  serviceName: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: true
  },
  
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Brand",
    required: true
  },

  carModel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CarModel",
    required: true
  },

  packageName: {
    type: String,
    enum: ["Basic", "Standard", "Premium"]
  },

  price: {
    type: Number
  },

  features: [
    {
      type: String
    }
  ]

}, { timestamps: true });

export default mongoose.model("ServicePackage", servicePackageSchema);
