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
  dueDate: Date,
  description: String,
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
  name: {
    type: String,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  //notifiche per attività
  notification: notificationSchema,
  participants: {
    type: [
      // usernames
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
      },
    ],
    default: [],
  },
  subActivities: {
    type: [subActivitySchema],
    default: [],
  },
  uid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },
  description: {
    type: String,
    default: "",
  },
});

const eventSchema = new mongoose.Schema({
  title: String,
  summary: String,
  uid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
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
    until: Date,
    count: Number,
    bymonth: Number,
    bymonthday: Number,
    byday: [{
      day: {
        type: String,
        enum: ["MO", "TU", "WE", "TH", "FR", "SA", "SU"]
      },
      position: { // Posizione nel mese (-1 per ultimo, 1-5 per primo-quinto)
        type: Number,
        min: -1,
        max: 5
      }
    }],
    bysetpos: [Number], // bysetpos[15] = il 15 del mese
    wkst: {
      type: String,
      enum: ["MO", "TU", "WE", "TH", "FR", "SA", "SU"],
      default: "MO"
    }
  },
  dtstart: Date,
  dtend: Date,
  dtstamp: String,
  allDay: Boolean,
  categories: [String],
  location: String,
  geo: {
    lat: Number,
    lon: Number,
  },
  description: String,
  participants: [String],
  URL: String,
  notification: notificationSchema,
});

const resourceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  used: [
    {
      startTime: {
        type: Date,
        required: true,
      },
      endTime: {
        type: Date,
        required: true,
      },
      claimant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
  ],
});

export { eventSchema, activitySchema, notificationSchema, resourceSchema };
