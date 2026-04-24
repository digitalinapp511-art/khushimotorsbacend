import Otp from "../models/Otp.js";
import User from "../models/User.js";
import {generateToken} from "../utils/jwt.js";
import otpGenerator from "otp-generator";

// ✅ SEND OTP
export const sendOTP = async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile) {
      return res.status(400).json({
        success: false,
        message: "Mobile number required",
      });
    }

    // Normalize mobile number
    const normalizedMobile = mobile.replace(/\D/g, "").slice(-10);
    
    if (normalizedMobile.length !== 10) {
      return res.status(400).json({
        success: false,
        message: "Invalid mobile number format",
      });
    }

    // Check rate limiting - prevent multiple OTP requests within 60 seconds
    const recentOtp = await Otp.findOne({
      mobile: normalizedMobile,
      createdAt: { $gte: new Date(Date.now() - 60 * 1000) }
    });

    if (recentOtp) {
      return res.status(429).json({
        success: false,
        message: "Please wait before requesting another OTP",
      });
    }

    const otp = otpGenerator.generate(6, {
      digits: true,
      alphabets: false,
      upperCase: false,
      specialChars: false,
    });

    // Delete old OTPs for this mobile
    await Otp.deleteMany({ mobile: normalizedMobile });

    // Create new OTP record
    await Otp.create({
      mobile: normalizedMobile,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min
    });

    console.log("OTP sent to", normalizedMobile, ":", otp); // For development - replace with SMS API

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      // In production, don't send the OTP in response
      // otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP. Please try again.",
    });
  }
};

export const verifyOTPController = async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      return res.status(400).json({
        success: false,
        message: "Mobile number and OTP are required",
      });
    }

    // Normalize mobile number
    const normalizedMobile = mobile.replace(/\D/g, "").slice(-10);
    
    if (normalizedMobile.length !== 10) {
      return res.status(400).json({
        success: false,
        message: "Invalid mobile number format",
      });
    }

    // Find valid OTP record
    const otpRecord = await Otp.findOne({
      mobile: normalizedMobile,
      otp,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // Find or create user
    let user = await User.findOne({ mobile: normalizedMobile });

    if (!user) {
      user = await User.create({ 
        mobile: normalizedMobile,
        isVerified: true 
      });
    } else {
      // Update user as verified
      user.isVerified = true;
      await user.save();
    }

    // Delete OTP after successful verification
    await Otp.deleteMany({ mobile: normalizedMobile });

    // Generate JWT token
    const token = generateToken({
      _id: user._id,
      mobile: normalizedMobile,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          _id: user._id,
          mobile: user.mobile,
          isVerified: user.isVerified,
        }
      },
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Verification failed. Please try again.",
    });
  }
};