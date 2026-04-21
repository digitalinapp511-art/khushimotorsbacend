import { sendWhatsApp } from "./whatsappService.js";

export const test = async () => {
    try {
        console.log("Test started");

        await sendWhatsApp(
            "9368765247",
            "Test message from insurance app 🚗"
        );

        console.log("Message function executed");
    } catch (err) {
        console.log("ERROR:", err);
    }
};

// test();