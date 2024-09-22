// notificationWorker.js
import { sendNotification } from './src/notifications.js';
import { createDataBase } from './src/database.js';

const NOTIFICATION_DELAY = 10000;

// Simulate sending notification
process.on('message', async (notificationData) => {
    console.log('Notification Worker:', notificationData.message);
    // ask the database for the next emails
    var db = await createDataBase();
    while (true) {
        // wait 30 seconds before sending the next notification
        await new Promise((resolve) => setTimeout(resolve, NOTIFICATION_DELAY));

        try { 
            const notifications = await db.getNextNotifications();
            await sendNotification(notifications);
        } catch (error) {
            console.log('Error sending notification:', error);
        }
    }
});

