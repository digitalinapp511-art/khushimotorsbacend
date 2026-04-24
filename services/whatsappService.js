import twilio from "twilio";

// Production Twilio configuration
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM;

// Validate required environment variables
const validateTwilioConfig = () => {
    if (!accountSid) {
        throw new Error("TWILIO_ACCOUNT_SID environment variable is required");
    }
    if (!authToken) {
        throw new Error("TWILIO_AUTH_TOKEN environment variable is required");
    }
    if (!whatsappFrom) {
        throw new Error("TWILIO_WHATSAPP_FROM environment variable is required");
    }
};

// Initialize Twilio client only when configuration is valid
let client = null;
try {
    validateTwilioConfig();
    client = twilio(accountSid, authToken);
    console.log("Twilio client initialized successfully");
} catch (error) {
    console.error("Twilio configuration error:", error.message);
    console.warn("WhatsApp messaging will be disabled until proper configuration is provided");
}

export const sendWhatsApp = async (phone, message) => {
    try {
        if (!client) {
            console.warn("Twilio client not initialized. Skipping WhatsApp message to:", phone);
            return { success: false, error: "Twilio not configured" };
        }

        // Validate phone number
        if (!phone || typeof phone !== 'string') {
            throw new Error("Valid phone number is required");
        }

        // Clean phone number - remove non-digits and ensure 10 digits for Indian numbers
        const cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length !== 10) {
            throw new Error("Invalid Indian phone number format");
        }

        // Send WhatsApp message
        const messageResponse = await client.messages.create({
            from: whatsappFrom,
            to: `whatsapp:+91${cleanPhone}`,
            body: message
        });

        console.log("WhatsApp message sent successfully to:", cleanPhone, "SID:", messageResponse.sid);
        return { success: true, messageId: messageResponse.sid };

    } catch (err) {
        console.error("Twilio WhatsApp Error:", err.message);
        return { success: false, error: err.message };
    }
};

// Template-based message functions for insurance reminders
export const sendInsuranceExpiryReminder = async (customerName, vehicleNo, policyNo, expiryDate, customerNumber) => {
    const message = `🚗 *Insurance Expiry Reminder*

Hi ${customerName},

Your car insurance for vehicle ${vehicleNo} (Policy No: ${policyNo}) will expire tomorrow (${expiryDate}).

Please renew it on time to stay protected and avoid any legal issues.

📞 For assistance: [Your Contact Number]
📍 Visit: [Your Service Center]

Thank you!
Khushi Motors`;

    return await sendWhatsApp(customerNumber, message);
};

export const sendInsuranceExpiryWarning = async (customerName, vehicleNo, policyNo, expiryDate, customerNumber) => {
    const message = `⚠️ *URGENT: Insurance Expiring Today*

Hi ${customerName},

Your car insurance for vehicle ${vehicleNo} (Policy No: ${policyNo}) expires TODAY (${expiryDate}).

This is your final reminder! Please renew immediately to avoid:
• Heavy fines
• Legal complications
• Lack of coverage

📞 Call us now for immediate assistance: [Your Contact Number]
📍 Visit: [Your Service Center]

Act now!
Khushi Motors`;

    return await sendWhatsApp(customerNumber, message);
};