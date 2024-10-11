import schedule from "node-schedule";
import { mongoose } from "mongoose";
import { createDataBase } from "./src/database.js";
import { webpush } from "./src/webPushConfig.js";
import nodemailer from "nodemailer";
import { config } from "dotenv";

async function checkAndSendNotifications() {
  console.log(`Checking notifications at ${new Date().toISOString()}`);

  try {
    // Get all user and their events from db
    var db = await createDataBase();
    const users = await db.getAllUserEvents();
    // Get the current time of the db
    const now = await db.getDateTime();

    for (const user of users) {
      // Check if the user is subscribed to notifications
      if (!user.subscription) continue;

      for (const event of user.events) {
        if (shouldSendNotification(event, now)) {
          const payload = createNotificationPayload(event);
          if (event.notification.type === "push") {
            console.log("sending push notification");
            await sendPushNotification(user.subscription, payload);
          } else if (event.notification.type === "email") {
            console.log("sending email notification");
            payload.email = user.email;
            await sendEmailNotification(payload);
          }
          console.log(`Sent notification to ${user.username}`);
        }
      }
    }
  } catch (error) {
    console.error("Error checking and sending notifications:", error);
  }
}

export function shouldSendNotification(event, now) {
  if (!event.notification) return false;

  const eventDate = new Date(event.dtstart);
  const notificationDate = new Date(event.notification.fromDate);

  if (now >= notificationDate && now < eventDate) {
    const { freq, interval } = event.notification.repetition;
    const timeDiff = now.getTime() - notificationDate.getTime();

    let unitInMilliseconds;
    switch (freq) {
      case "minutely":
        unitInMilliseconds = 60 * 1000;
        break;
      case "hourly":
        unitInMilliseconds = 60 * 60 * 1000;
        break;
      case "daily":
        unitInMilliseconds = 24 * 60 * 60 * 1000;
        break;
      case "weekly":
        unitInMilliseconds = 7 * 24 * 60 * 60 * 1000;
        break;
      case "monthly":
        unitInMilliseconds = 30 * 24 * 60 * 60 * 1000; // Approssimazione
        break;
      case "yearly":
        unitInMilliseconds = 365 * 24 * 60 * 60 * 1000; // Approssimazione
        break;
      default:
        console.log(`Unsupported frequency: ${freq}`);
        return false;
    }

    const unitsSinceStart = Math.floor(timeDiff / unitInMilliseconds);
    const isOnInterval = unitsSinceStart % interval === 0;
    const isWithinFirstMinute = timeDiff % unitInMilliseconds < 60000;

    return isOnInterval && isWithinFirstMinute;
  }

  return false;
}

export function createNotificationPayload(event) {
  const formattedDate = event.dtstart.toLocaleString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return {
    title: event.notification.title || `Reminder: ${event.title}`,
    body: `Reminder: Your event "${event.title}" is planned for "${formattedDate}!`,
  };
}

export async function sendPushNotification(subscription, payload) {
  try {
    const result = await webpush.sendNotification(
      subscription,
      JSON.stringify(payload),
    );
  } catch (error) {
    console.error("Detailed error in sendPushNotification:", error);
    if (error.statusCode === 401) {
      console.error("Authorization error. Check VAPID configuration.");
    }
    throw error;
  }
}

async function sendEmailNotification(payload) {
  config();
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // use false for STARTTLS; true for SSL on port 465
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: "selfie.notification@gmail.com",
    to: payload.email,
    subject: payload.title,
    text: payload.body,
  };

  if (process.env.NODE_ENV !== "production") {
    console.log("Faking sending email:", mailOptions);
    return;
  }

  // Send the email
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log("Error:", error);
    } else {
      console.log("Email sent: ", mailOptions, info.response);
    }
  });
}

// Programma l'esecuzione del controllo ogni minuto
schedule.scheduleJob("* * * * *", checkAndSendNotifications);
