import Otp from "../models/Otp.js";
import User from "../models/User.js";
import {generateToken} from "../utils/jwt.js";
import otpGenerator from "otp-generator";

// ✅ SEND OTP
export const sendOtp = async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile) {
      return res.status(400).json({
        success: false,
        message: "Mobile number required",
      });
    }

    const otp = otpGenerator.generate(6, {
      digits: true,
      alphabets: false,
      upperCase: false,
      specialChars: false,
    });

    // delete old OTP
    await Otp.deleteMany({ mobile });

    await Otp.create({
      mobile,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min
    });

    console.log("OTP:", otp); // ⚠️ replace with SMS API

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const verifyOtp = async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    const otpRecord = await Otp.findOne({ mobile, otp });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    // find or create user
    let user = await User.findOne({ mobile });

    if (!user) {
      user = await User.create({ mobile });
    }

    // delete OTP after use
    await Otp.deleteMany({ mobile });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token: generateToken(user._id),
      
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};