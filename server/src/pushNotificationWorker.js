import schedule from "node-schedule";
import { webpush } from "./webPushConfig.js";
import nodemailer from "nodemailer";
import { config } from "dotenv";
import { emitNotification } from "./socket.js";

const result = config();
if (result.error) {
  config({ path: "/webapp/.env" });
}

export default function createNotificationWorker(db) {
  async function checkAndSendNotifications() {
    console.log(`Checking notifications at ${new Date().toISOString()}`);

    try {
      const users = await db.getAllUserEvents();
      const now = await db.getDateTime();

      for (const user of users) {
        if (!user.notifications) continue;

        for (const event of user.events) {
          if (shouldSendNotification(event, now)) {
            const payload = createNotificationPayload(event);

            if (
              event.notification.type === "push" &&
              user.notifications.pushOn
            ) {
              console.log("sending push notification");
              await sendPushNotifications(
                user.notifications.subscriptions,
                payload,
              );
            } else if (
              event.notification.type === "email" &&
              user.notifications.emailOn
            ) {
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

  function shouldSendNotification(event, now) {
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

  function createNotificationPayload(event) {
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

  async function sendPushNotifications(subscriptions, payload) {
    for (const subscription of subscriptions) {
      try {
        await webpush.sendNotification(subscription, JSON.stringify(payload));
      } catch (error) {
        console.error(
          `Error sending push notification to device ${subscription.deviceName}:`,
          error,
        );
        if (error.statusCode === 401) {
          console.error("Authorization error. Check VAPID configuration.");
        }
      }
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

  async function sendNotification(user, payload) {
    try {
      if (!payload.title || !payload.body) {
        throw new Error("Title and body are required in the payload");
      }

      if (!user || !user.isVerified) {
        throw new Error("User not found or not verified");
      }

      const notifications = [];
      console.log("sending notification to user");
      await emitNotification(user._id.toString(), payload);

      if (
        user.notifications?.pushOn &&
        user.notifications.subscriptions?.length > 0
      ) {
        const pushPayload = {
          title: payload.title,
          body: payload.body,
          data: { url: payload.link },
        };

        notifications.push(
          sendPushNotifications(user.notifications.subscriptions, pushPayload),
        );
      }

      if (user.notifications?.emailOn && user.email) {
        const emailPayload = {
          email: user.email,
          title: payload.title,
          body: `${payload.body}\n\nPer maggiori informazioni: ${payload.link}`,
        };

        notifications.push(sendEmailNotification(emailPayload));
      }
      notifications.push(db.addNotificationToInbox(user._id, payload));
      await Promise.all(notifications);
      console.log(`Notifications sent successfully to user ${user.username}`);
    } catch (error) {
      console.error("Error sending notifications:", error);
      throw error;
    }
  }

  const notifyON = process.env.NOTIFICATION === "true";

  if (notifyON) {
    // Check every minute
    schedule.scheduleJob("* * * * *", checkAndSendNotifications(db));
  }
  return sendNotification;
}
