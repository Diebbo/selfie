import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  title: String,
  description: String,
  type: String,
  repetition: {
    freq: String, // minutely, hourly, daily, weekly, monthly, yearly
    interval: Number, // every x minutes/hours/days/weeks/months/years
  },
  fromDate: Date, // anticipo rispetto a data evento
});

const subActivitySchema = new mongoose.Schema({
  name: String,
  startDate: Date,
  dueDate: Date,
  completed: {
    type: Boolean,
    default: false,
  },
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
  ],
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  },
});

const activitySchema = new mongoose.Schema({
  name: String,
  startDate: {
    type: Date,
    required: false,
  },
  dueDate: Date,
  completed: {
    type: Boolean,
    default: false,
  },
  //notifiche per attività
  notification: notificationSchema,
  participants: [
    // usernames
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
  ],
  subActivities: [subActivitySchema],
  uid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },
});

const eventSchema = new mongoose.Schema({
  title: String,
  summary: String,
  uid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },
  sequence: Number,
  status: {
    type: String,
    enum: ["confirmed", "tentative", "cancelled"],
  },
  transp: String,
  rrule: {
    freq: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"],
    },
    interval: Number,
    bymonth: Number,
    bymonthday: Number,
  },
  dtstart: Date,
  dtend: Date,
  dtstamp: String,
  categories: [String],
  location: String,
  geo: {
    lat: Number,
    lon: Number,
  },
  description: String,
  URL: String,
  notification: notificationSchema,
});

export { eventSchema, activitySchema, notificationSchema };
