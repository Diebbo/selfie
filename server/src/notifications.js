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
    console.log("Sending email:", email);
  }
  // Add logic to send email
}

import nodemailer from "nodemailer";
import dotenv from "dotenv";

export const sendMail = async (to, subject, html) => {
  dotenv.config();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: "selfie.notifications@gmail.com",
    to: to,
    subject: subject,
    html: html,
  };

  console.log(mailOptions);

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      reject(error);
    } else {
      console.log("Email sent: " + info.response);
      resolve(info.response);
    }
  });
};
