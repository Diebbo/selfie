import mongoose from 'mongoose';

export const notificationSchema = new mongoose.Schema({
          title: String,
          type: String,
          repetition:
          {
            freq: String, // daily, weekly, monthly, yearly
            interval: Number, 
          }, 
          fromDate: Date, // anticipo rispetto a data evento
});

export const activitySchema = new mongoose.Schema({
    name: String,
    dueDate: Date,
    completed: Boolean,
    //notifiche per attività
    notification: notificationSchema,
    subActivity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Activity'
    }
});

export const eventSchema = new mongoose.Schema({
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

