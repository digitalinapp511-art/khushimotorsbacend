import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY;

export const adminLogin = async (req, res) => {

  try {

    const { key } = req.body;
    // console.log("Admin login attempt with key:", key);

    if (!key) {
      return res.status(400).json({
        success: false,
        message: "Admin key required"
      });
    }

    // Check key

    if (key !== ADMIN_SECRET_KEY) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin key"
      });
    }

    // Generate token

    const token = jwt.sign(
      {
        role: "admin"
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );

    res.json({
      success: true,
      message: "Admin login successful",
      token
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Admin login failed"
    });

  }

};