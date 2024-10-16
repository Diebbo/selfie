import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    title: String,
    description: String,
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
    startDate: {
        type: Date,
        required: false
    },
    dueDate: Date,
    completed: {
        type: Boolean,
        default: false
    },
    //notifiche per attività
    notification: notificationSchema,
    participants: [
        // usernames
        String
    ],
    subActivities: [
        // should be an array of activitySchema but it's not defined yet
    ],
    uid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    parentId: {} 
});

const eventSchema = new mongoose.Schema({
    title: String,
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
    dtstart: Date,
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
