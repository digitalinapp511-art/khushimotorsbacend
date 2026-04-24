import crypto from "crypto";

// Razorpay configuration with auto-detection of test/live mode
const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

// Auto-detect mode based on key
const isTestMode = razorpayKeyId?.startsWith('rzp_test_') || false;
const isLiveMode = razorpayKeyId?.startsWith('rzp_live_') || false;
const razorpayMode = isTestMode ? 'TEST' : isLiveMode ? 'LIVE' : 'NONE';

// Log current mode on startup
if (razorpayMode !== 'NONE') {
  console.log(`🔧 Razorpay configured in ${razorpayMode} mode`);
} else {
  console.log('⚠️  Razorpay not configured');
}

// Verify Razorpay payment signature (works for both test and live)
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing required payment verification parameters",
      });
    }

    if (!razorpayKeySecret) {
      return res.status(500).json({
        success: false,
        message: "Razorpay configuration missing - please check RAZORPAY_KEY_SECRET",
      });
    }

    // Create the expected signature (same for test and live)
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", razorpayKeySecret)
      .update(body.toString())
      .digest("hex");

    // Compare signatures
    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      console.log(`✅ Payment verified successfully in ${razorpayMode} mode`);
      return res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        data: {
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          mode: razorpayMode,
        },
      });
    } else {
      console.log(`❌ Invalid payment signature in ${razorpayMode} mode`);
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Payment verification failed",
    });
  }
};

// Get Razorpay key for frontend (auto-detects test/live)
export const getRazorpayKey = (req, res) => {
  try {
    if (!razorpayKeyId) {
      return res.status(500).json({
        success: false,
        message: "Razorpay key not configured - please add RAZORPAY_KEY_ID to .env",
      });
    }

    return res.status(200).json({
      success: true,
      keyId: razorpayKeyId,
      mode: razorpayMode,
      isTestMode,
      isLiveMode,
    });
  } catch (error) {
    console.error("Get Razorpay key error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get payment key",
    });
  }
};

// Create Razorpay order (works for both test and live)
export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, currency = "INR", receipt } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid amount is required",
      });
    }

    if (!razorpayKeyId || !razorpayKeySecret) {
      return res.status(500).json({
        success: false,
        message: "Razorpay configuration missing - please check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET",
      });
    }

    // Import Razorpay dynamically
    const Razorpay = (await import("razorpay")).default;
    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });

    const options = {
      amount: amount * 100, // Convert to paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      payment_capture: 1,
    };

    console.log(`📝 Creating Razorpay order in ${razorpayMode} mode for amount: ${amount}`);
    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      order: {
        ...order,
        mode: razorpayMode,
      },
    });
  } catch (error) {
    console.error("Create Razorpay order error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create payment order",
    });
  }
};

// Get Razorpay configuration status
export const getRazorpayStatus = (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      configured: !!razorpayKeyId && !!razorpayKeySecret,
      mode: razorpayMode,
      isTestMode,
      isLiveMode,
      keyIdPrefix: razorpayKeyId ? razorpayKeyId.substring(0, 8) + '...' : null,
    });
  } catch (error) {
    console.error("Get Razorpay status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get Razorpay status",
    });
  }
};
