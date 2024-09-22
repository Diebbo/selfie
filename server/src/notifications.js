// src/notifications.js
/* 
 *     inboxNotifications: [{
        fromEvent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event'
        },
        fromTask: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Activity'
        },
        when: Date,
        title: String,
        method: {
            type: String,
            enum: ['system', 'email']
        },
    }],
*/
export async function sendNotification(notificationData) {
    // Example: Send email or push notification here
    await sendEmail(notificationData.email);
    // sendPushNotification(notificationData.pushNotification);
}

async function sendEmail(emails) {
    // Example: Send email
    for (const email of emails) {
        console.log('Sending email:', email);
    }
    // Add logic to send email
}
