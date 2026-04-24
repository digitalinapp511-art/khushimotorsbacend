import Insurance from "../models/Insurance.js";
import { sendInsuranceExpiryReminder, sendInsuranceExpiryWarning } from "../services/whatsappService.js";

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const checkInsuranceReminders = async () => {
  const today = new Date();
  
  // Check for 1-day reminders
  const pendingReminders = await Insurance.find({ reminder1DaySent: { $ne: true } });

  const oneDayReminderData = pendingReminders.filter((item) => {
    const diff = Math.ceil(
      (startOfDay(item.policyValidity) - startOfDay(today)) / (1000 * 60 * 60 * 24)
    );
    return diff === 1;
  });

  console.log("Processing 1-day insurance reminders:", oneDayReminderData.length);

  for (const item of oneDayReminderData) {
    try {
      const result = await sendInsuranceExpiryReminder(
        item.customerName,
        item.vehicleNo,
        item.policyNo,
        item.policyValidity.toDateString(),
        item.customerNumber
      );
      
      if (result.success) {
        item.reminder1DaySent = true;
        await item.save();
        console.log(`1-day reminder sent to ${item.customerNumber} for vehicle ${item.vehicleNo}`);
      } else {
        console.error(`Failed to send 1-day reminder to ${item.customerNumber}:`, result.error);
      }
    } catch (error) {
      console.error(`Error processing 1-day reminder for ${item.vehicleNo}:`, error.message);
    }
  }

  // Check for same-day expiry warnings
  const sameDayReminders = await Insurance.find({ reminderSameDaySent: { $ne: true } });

  const sameDayReminderData = sameDayReminders.filter((item) => {
    const diff = Math.ceil(
      (startOfDay(item.policyValidity) - startOfDay(today)) / (1000 * 60 * 60 * 24)
    );
    return diff === 0;
  });

  console.log("Processing same-day insurance warnings:", sameDayReminderData.length);

  for (const item of sameDayReminderData) {
    try {
      const result = await sendInsuranceExpiryWarning(
        item.customerName,
        item.vehicleNo,
        item.policyNo,
        item.policyValidity.toDateString(),
        item.customerNumber
      );
      
      if (result.success) {
        item.reminderSameDaySent = true;
        await item.save();
        console.log(`Same-day warning sent to ${item.customerNumber} for vehicle ${item.vehicleNo}`);
      } else {
        console.error(`Failed to send same-day warning to ${item.customerNumber}:`, result.error);
      }
    } catch (error) {
      console.error(`Error processing same-day warning for ${item.vehicleNo}:`, error.message);
    }
  }

  console.log("Insurance reminders processed successfully");
};
