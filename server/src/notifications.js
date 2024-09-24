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
export async function sendNotification(transporter, notificationData) {
    // Example: Send email or push notification here
    try {
        await sendEmail(transporter, notificationData.email);
    } catch (error) {
        console.log('Error sending email:', error);
    }

    /* try {
        await sendPushNotification(notificationData.pushNotification);
    } catch (error) {
        console.log('Error sending push notification:', error);
    }
    */
}

async function sendEmail(transporter, emails) {
    for (const email of emails) {
        // Configure the mailoptions object
        const mailOptions = {
            from: 'selfie.notifications@gmail.com',
            to: email.to,
            subject: email.subject,
            text: email.body
        };

        if (process.env.NODE_ENV === 'development') {
            console.log('Email:', mailOptions);
            continue;
        }

        // Send the email
        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.log('Error:', error);
            } else {
                console.log('Email sent: ', mailOptions, info.response);
            }
        });
    }
}
