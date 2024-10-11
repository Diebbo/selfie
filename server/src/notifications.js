// SHOULD BE DEPRECATED, but for now let's keep it
/*

// src/notifications.js
import { config } from "dotenv";
import nodemailer from "nodemailer";
/*
      inboxNotifications: [{
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


export async function sendEmailNotification(payload) {
  // Example: Send email or push notification here
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

  try {
    await sendEmail(transporter, payload);
  } catch (error) {
    console.log("Error sending email:", error);
  }

  /* try {
        await sendPushNotification(notificationData.pushNotification);
    } catch (error) {
        console.log('Error sending push notification:', error);
    }

}

async function sendEmail(transporter, payload) {
  // Configure the mailoptions object
  const mailOptions = {
    from: "selfie.notifications@gmail.com",
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
*/
