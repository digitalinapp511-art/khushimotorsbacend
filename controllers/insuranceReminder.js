import Insurance from "../models/Insurance.js";
import { sendWhatsApp } from "../services/whatsappService.js";

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const checkInsuranceReminders = async () => {
  const today = new Date();
  const pendingReminders = await Insurance.find({ reminder1DaySent: { $ne: true } });

  const oneDayReminderData = pendingReminders.filter((item) => {
    const diff = Math.ceil(
      (startOfDay(item.policyValidity) - startOfDay(today)) / (1000 * 60 * 60 * 24)
    );
    return diff === 1;
  });

  console.log("1 Day Reminder Data:", oneDayReminderData.length);

  for (const item of oneDayReminderData) {
    const msg = `Hi ${item.customerName},

Your car insurance for vehicle ${item.vehicleNo} (Policy No: ${item.policyNo}) will expire tomorrow (${item.policyValidity.toDateString()}).

Please renew it on time to stay protected 🚗`;

    await sendWhatsApp(item.customerNumber, msg);
    item.reminder1DaySent = true;
    await item.save();
  }

  console.log("Insurance 1-day reminders processed");
};
