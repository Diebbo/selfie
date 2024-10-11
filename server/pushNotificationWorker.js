import schedule from "node-schedule";
import { mongoose } from "mongoose";
import { userSchema } from "./src/models/user-model.js";
import { sendPushNotification } from "./notificationWorker.js";

const userModel = mongoose.model("User", userSchema);

// Funzione per controllare e inviare le notifiche
async function checkAndSendNotifications() {
  console.log(`Checking notifications at ${new Date().toISOString()}`);
  const now = new Date();

  try {
    const users = await userModel.find().populate("events");

    for (const user of users) {
      if (!user.subscription) continue;

      for (const event of user.events) {
        if (shouldSendNotification(event, now)) {
          const payload = createNotificationPayload(event);
          await sendPushNotification(user.subscription, payload);
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

// Programma l'esecuzione del controllo ogni minuto
schedule.scheduleJob("* * * * *", checkAndSendNotifications);

// Assicurati che la connessione al database sia stabilita prima di iniziare il worker
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Notification worker connected to database"))
  .catch((err) =>
    console.error("Notification worker failed to connect to database:", err),
  );
