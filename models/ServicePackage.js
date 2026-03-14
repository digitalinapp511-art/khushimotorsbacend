import mongoose from "mongoose";

const servicePackageSchema = new mongoose.Schema({

  serviceName: {
    type: String
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

});

export default mongoose.model("ServicePackage", servicePackageSchema);