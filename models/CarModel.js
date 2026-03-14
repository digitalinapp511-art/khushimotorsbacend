import mongoose from "mongoose";

const carModelSchema = new mongoose.Schema({

  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Brand",
    required: true
  },

  name: {
    type: String,
    required: true
  }

});

export default mongoose.model("CarModel", carModelSchema);