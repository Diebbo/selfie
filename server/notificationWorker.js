// notificationWorker.js
import { sendNotification } from "./src/notifications.js";
import { createDataBase } from "./src/database.js";
import nodemailer from "nodemailer";
import { exit } from "process";
import dotenv from "dotenv";
import { webpush } from "./src/webPushConfig.js";

// Simulate sending notification
process.on("message", async (notificationData) => {
  console.log("Notification Worker:", notificationData.message);
  // Load the environment variables
  dotenv.config();
  let db, transporter;
  // ask the database for the next emails
  try {
    db = await createDataBase();
  } catch (error) {
    console.log("Error creating database:", error);
    exit(1);
  }
  try {
    // configure nodemailer
    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // use false for STARTTLS; true for SSL on port 465
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });
  } catch (error) {
    console.log("Error configuring nodemailer:", error);
    exit(1);
  }

  while (true) {
    // wait 30 seconds before sending the next notification
    await new Promise((resolve) =>
      setTimeout(resolve, process.env.NOTIFICATION_DELAY),
    );

    try {
      const notifications = await db.getNextNotifications();
      await sendNotification(transporter, notifications);
    } catch (error) {
      console.log("Error sending notification:", error);
    }
  }
});

export async function sendPushNotification(subscription, payload) {
  console.log("Sending notification to:", subscription.endpoint);
  try {
    const result = await webpush.sendNotification(
      subscription,
      JSON.stringify(payload),
    );
    console.log("Notification sent successfully:", result);
  } catch (error) {
    console.error("Detailed error in sendPushNotification:", error);
    if (error.statusCode === 401) {
      console.error("Authorization error. Check VAPID configuration.");
    }
    throw error;
  }
}
