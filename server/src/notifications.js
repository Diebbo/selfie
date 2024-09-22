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
    console.log('Sending notification:', notificationData);
    sendEmail(notificationData.email);
    // sendPushNotification(notificationData.pushNotification);
}

async function sendEmail(email) {
    // Example: Send email
    console.log('Sending email:', email);
    // Add logic to send email
}
