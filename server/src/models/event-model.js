import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
          title: String,
          type: String,
          repetition:
          {
            freq: String, // daily, weekly, monthly, yearly
            interval: Number, 
          }, 
          fromDate: Date, // anticipo rispetto a data evento
});

const activitySchema = new mongoose.Schema({
    name: String,
    dueDate: Date,
    completed: Boolean,
    //notifiche per attività
    notification: notificationSchema,
    subActivity: [
        // should be an array of activitySchema but it's not defined yet
    ],
});

const eventSchema = new mongoose.Schema({
    summary: String,
    uid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    sequence: Number,
    status: {
        type: String,
        enum: ['confirmed', 'tentative', 'cancelled']
    },
    transp: String,
    rrule: {
        freq: {
            type: String,
            enum: ['daily', 'weekly', 'monthly', 'yearly']
        },
        interval: Number,
        bymonth: Number,
        bymonthday: Number
    },
    dstart: Date,
    dtend: Date,
    dtstamp: String,
    categories: [String],
    location: String,
    geo: [Number],
    description: String,
    URL: String,
    notification: notificationSchema,
});

export { eventSchema, activitySchema, notificationSchema };
