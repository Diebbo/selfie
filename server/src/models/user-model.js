import { mongoose } from "mongoose";

export const userSchema = new mongoose.Schema({
  //campi user di default per l'iscrizione
  username: String,
  password: String,
  email: String,
  emailtoken: String,
  isVerified: Boolean,

  notifications: {
    emailOn: Boolean,
    pushOn: Boolean,
    subscriptions: [
      {
        device_name: String,
        endpoint: String,
        expirationTime: String,
        keys: {
          p256dh: String,
          auth: String,
        },
      },
    ],
  },

  name: String,
  surname: String,
  phoneNumber: String,
  birthDate: Date,

  address: String,
  city: String,
  state: String,
  zip: String,
  country: String,

  role: String, // common user, super user (resource manager), resource, admin

  //campi aggiungibili dall'utente
  events: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
    },
  ],

  //eventi a cui ho accettato la partecipazione
  participatingEvents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
    },
  ],

  //eventi pendenti
  invitedEvents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
    },
  ],

  notes: [
    {
      title: String,
      content: String,
      date: Date,
      tags: [String],
    },
  ],

  position: {
    latitude: Number,
    longitude: Number,
  },

  pomodoro: {
    totalStudyTime: Number,
    totalBreakTime: Number,
    settings: {
      studyDuration: Number,
      shortBreakDuration: Number,
      longBreakDuration: Number,
    },
  },

  musicPlayer: {
    songPlaying: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Song",
    },
    currentTime: Number,
    likedSongs: [String],
  },

  activities: [
    {
      activityId: {
        type: mongoose.Schema.Types.ObjectId, //chi ha prenotato risorsa
        ref: "Activity",
      },
    },
  ],

  //campi per risorse
  resource: {
    maxPartecipants: Number, //numero massimo di partecipanti
    claimant: {
      type: mongoose.Schema.Types.ObjectId, //chi ha prenotato risorsa
      ref: "User",
    },
    booked: Boolean,
    date: [Date], //date in cui la risorsa è prenotata
  },

  //campi per amici
  friends: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  // lista di notifiche
  inboxNotifications: [
    {
      fromMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
      },
      fromEvent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
      },
      fromTask: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Activity",
      },
      when: Date,
      title: String,
      description: String,
      method: {
        type: String,
        enum: ["system", "email"],
      },
    },
  ],

  // progetti a cui partecipo
  projects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
  ],

  isOnline: Boolean,
  lasteSeen: Date,
});
