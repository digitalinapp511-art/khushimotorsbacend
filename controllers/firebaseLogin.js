import admin from "../config/firebase.js";
import User from "../models/User.js";
import { generateToken } from "../utils/jwt.js";

/* ================= FIREBASE AUTH ================= */
export const firebaseLogin = async (req, res) => {
  try {
    const { idToken, firebaseUid, phone } = req.body;

    // ✅ Validate input
    if (!idToken || !firebaseUid || !phone) {
      return res.status(400).json({
        success: false,
        message: "idToken, firebaseUid and phone are required in request body",
      });
    }

    // ✅ Verify Firebase Token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    // console.log("decodedToken", decodedToken);
    // 🔒 Check UID match
    if (decodedToken.uid !== firebaseUid) {
      return res.status(401).json({
        success: false,
        message: "Invalid Firebase UID",
      });
    }

    // 🔒 Extract phone from Firebase token
    const firebasePhone = decodedToken.phone_number;

    if (!firebasePhone) {
      return res.status(400).json({
        success: false,
        message: "Phone not found in Firebase token",
      });
    }

    // ✅ Normalize both phones
    const cleanFrontendPhone = phone.replace(/\D/g, "").slice(-10);
    const cleanFirebasePhone = firebasePhone.replace(/\D/g, "").slice(-10);

    // 🔒 Match phone (VERY IMPORTANT)
    if (cleanFrontendPhone !== cleanFirebasePhone) {
      return res.status(401).json({
        success: false,
        message: "Phone number mismatch",
      });
    }

    // 🔥 Find or Create User
    let user = await User.findOne({ mobile: cleanFrontendPhone });

    if (!user) {
      console.log("Creating new user", cleanFrontendPhone, firebaseUid);
      user = await User.create({
        mobile: cleanFrontendPhone,
        firebaseUid,
        isVerified: true,
      });
    }

    // 🔐 Generate your app JWT
    const token = generateToken({
      userId: user._id,
      phone: cleanFrontendPhone,
    });

    // (optional) store token
    user.token = token;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Authentication successful",
      data: {
        token,
        user,
      },
    });
  } catch (error) {
    console.error("Firebase Auth Error:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired Firebase token in " + error.message,
    });
  }
};