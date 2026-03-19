import mongoose from "mongoose";

const insuranceSchema = new mongoose.Schema({
  policyNo: {
    type: String,
    required: true,
    trim: true
  },
  insuranceCompany: {
    type: String,
    required: true,
    trim: true
  },
  vehicleNo: {
    type: String,
    required: true,
    trim: true
  },
  vehicleName: {
    type: String,
    required: true,
    trim: true
  },
  policyValidity: {
    type: Date,
    required: true
  },
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  customerNumber: {
    type: String,
    required: true,
    trim: true
  },
  agentName: {
    type: String,
    trim: true
  },
  jobNumber: {
    type: String,
    trim: true
  },
  policyDoc: {
    type: String,
    trim: true
  },
  rc: {
    type: String,
    trim: true
  },
  panAadhar: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    trim: true,
    default: "pending"
  }
}, { timestamps: true });

export default mongoose.model("Insurance", insuranceSchema);
