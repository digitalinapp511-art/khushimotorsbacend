import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID || process.env.ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN || process.env.AUTH_TOKEN;
const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886";

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

export const sendWhatsApp = async (phone, message) => {
    try {
        if (!client) {
            console.warn("Twilio is not configured. Skipping WhatsApp message.");
            return;
        }

        await client.messages.create({
            from: whatsappFrom,
            to: `whatsapp:+91${phone}`,
            body: message
        });

        console.log("Message sent to:", phone);
    } catch (err) {
        console.log("Twilio Error:", err.message);
    }
};