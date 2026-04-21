import twilio from "twilio";

const client = twilio(
    process.env.ACCOUNT_SID,
    process.env.AUTH_TOKEN
);

export const sendWhatsApp = async (phone, message) => {
    try {
        await client.messages.create({
            // Twilio sandbox
            from: "whatsapp:+14155238886", 
            // from: "whatsapp:+17754415324", 
            to: `whatsapp:+91${phone}`,
            body: message
        });

        console.log("Message sent to:", phone);
    } catch (err) {
        console.log("Twilio Error:", err.message);
    }
};