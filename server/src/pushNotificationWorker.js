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
        if (!user?.notifications) {
          console.log(
            `Skipping user ${user.username}: no notifications config`,
          );
          continue;
        }

        for (const event of user.events || []) {
          if (!event?.notification) {
            console.log(
              `Skipping event ${event?.title}: no notification config`,
            );
            continue;
          }

          try {
            if (shouldSendNotification(event, now)) {
              const payload = createNotificationPayload(event);

              if (
                event.notification.type === "push" &&
                user.notifications.pushOn
              ) {
                console.log(
                  `Sending push notification for event: ${event.title}`,
                );
                await sendPushNotifications(
                  user.notifications.subscriptions,
                  payload,
                );
              } else if (
                event.notification.type === "email" &&
                user.notifications.emailOn
              ) {
                console.log(
                  `Sending email notification for event: ${event.title}`,
                );
                payload.email = user.email;
                await sendEmailNotification(payload);
              }
              console.log(
                `Successfully sent notification to ${user.username} for event ${event.title}`,
              );
            }
          } catch (eventError) {
            console.error(
              `Error processing event ${event?.title} for user ${user.username}:`,
              eventError,
            );
            // Continue with next event
          }
        }
      }
    } catch (error) {
      console.error("Error checking and sending notifications:", error);
    }
  }

  function shouldSendNotification(event, now) {
    if (!event?.notification?.repetition?.freq) {
      console.error(`Missing frequency for event: ${event?.title}`);
      return false;
    }

    const eventDate = new Date(event.dtstart);
    const notificationDate = new Date(event.notification.fromDate);

    if (now >= notificationDate && now < eventDate) {
      const { freq, interval = 1 } = event.notification.repetition;
      const timeDiff = now.getTime() - notificationDate.getTime();

      let unitInMilliseconds;
      switch (freq.toLowerCase()) {
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
          unitInMilliseconds = 30 * 24 * 60 * 60 * 1000;
          break;
        case "yearly":
          unitInMilliseconds = 365 * 24 * 60 * 60 * 1000;
          break;
        default:
          console.error(
            `Unsupported frequency: ${freq} for event ${event.title}`,
          );
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
    if (!event?.dtstart) {
      console.error("Missing dtstart for event:", event);
      return {
        title: "Event Reminder",
        body: "You have an upcoming event",
      };
    }

    const formattedDate = new Date(event.dtstart).toLocaleString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    return {
      title: event.notification?.title || `Reminder: ${event.title}`,
      body: `Reminder: Your event "${event.title}" is planned for ${formattedDate}!`,
    };
  }

  async function sendPushNotifications(subscriptions, payload) {
    if (!Array.isArray(subscriptions)) {
      console.error("Invalid subscriptions:", subscriptions);
      return;
    }

    for (const subscription of subscriptions) {
      try {
        await webpush.sendNotification(subscription, JSON.stringify(payload));
      } catch (error) {
        console.error(
          `Error sending push notification to device ${subscription?.deviceName}:`,
          error,
        );
        if (error.statusCode === 401) {
          console.error("Authorization error. Check VAPID configuration.");
        }
      }
    }
  }

  async function sendEmailNotification(payload) {
    if (!payload?.email) {
      console.error("Missing email in payload:", payload);
      return;
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
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

    transporter.sendMail(mailOptions, function(error, info) {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent:", mailOptions, info.response);
      }
    });
    return;
  }

  async function sendNotification(user, payload) {
    try {
      // Validate payload
      if (!payload?.title || !payload?.body) {
        throw new Error("Title and body are required in the payload");
      }

      // Validate user
      if (!user?._id) {
        throw new Error("Invalid user object");
      }

      if (user.isVerified) await emitNotification(user._id.toString(), payload);

      // Add push notifications if enabled
      if (
        user.notifications?.pushOn &&
        Array.isArray(user.notifications.subscriptions) &&
        user.notifications.subscriptions.length > 0
      ) {
        const pushPayload = {
          title: payload.title,
          body: payload.body,
          data: { url: payload.link },
        };

        // Send to all subscriptions in one batch
        await sendPushNotifications(
          user.notifications.subscriptions,
          pushPayload,
        );
      }

      // Add email notification if enabled
      if (user.notifications?.emailOn && user.email) {
        const emailPayload = {
          email: user.email,
          title: payload.title,
          body: `${payload.body}\n\n<a href="http://site232454.tw.cs.unibo/${payload.link}>Click here to view</a>`,
        };

        await sendEmailNotification(emailPayload);
      }

      db.addNotificationToInbox(user._id, payload);

      console.log(`Successfully sent all notifications to ${user.username}`);
    } catch (error) {
      console.error(
        `Failed to send notifications to user ${user.username}:`,
        error,
      );
      throw new Error(`Notification delivery failed: ${error.message}`);
    }
  }

  const notifyON = process.env.NOTIFICATION === "true";

  if (notifyON) {
    // Bind db context to the check function
    const check = checkAndSendNotifications.bind(null);

    // Schedule job with error handling
    try {
      const job = schedule.scheduleJob("* * * * *", check);

      if (!job) {
        console.error("Failed to schedule notification check job");
      } else {
        console.log("Successfully scheduled notification check job");
      }
    } catch (error) {
      console.error("Error scheduling notification check job:", error);
    }
  } else {
    console.log(
      "Notifications are disabled via NOTIFICATION environment variable",
    );
  }

  return sendNotification;
}
