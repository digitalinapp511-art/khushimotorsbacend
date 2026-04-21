import cron from "node-cron";
import { checkInsuranceReminders } from "../controllers/insuranceReminder.js";

// Runs every day at 9:00 AM

cron.schedule("* * * * *", () => {
    console.log("Running insurance reminder job...");
    checkInsuranceReminders();
});