import admin from "firebase-admin";
import dotenv from "dotenv"
dotenv.config()
const noopMessaging = {
  sendEachForMulticast: async () => ({
    successCount: 0,
    failureCount: 0,
    responses: [],
  }),
};

let isInitialized = false;

try {
  if (!admin.apps.length) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT || "";
    console.log("process", raw ? "provided" : "not");
    console.log("🔥 FIREBASE ENV CHECK:", process.env.FIREBASE_SERVICE_ACCOUNT ? "✅ Found" : "❌ Missing") 
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.private_key) {
        parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
      }
      admin.initializeApp({
        credential: admin.credential.cert(parsed),
      });
      isInitialized = true;

    } else {
      // Keep server booting even when FCM is not configured (e.g., Render first deploy).
      console.warn("FCM not configured: FIREBASE_SERVICE_ACCOUNT is missing. Notifications are disabled.");
    }
  } else {
    isInitialized = true;
  }
} catch (err) {
  console.error("FCM init failed. Notifications are disabled:", err.message);
}

const firebaseAdmin = isInitialized
  ? admin
  : {
    auth: () => ({
      verifyIdToken: async () => {
        throw new Error("Firebase not initialized");
      },
    }),
    messaging: () => noopMessaging,
  };

  export default firebaseAdmin;