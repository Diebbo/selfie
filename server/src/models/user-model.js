import { mongoose } from "mongoose";

export const userSchema = new mongoose.Schema({
  //campi user di default per l'iscrizione
  username: String,
  password: String,
  email: String,
  emailtoken: String,
  isVerified: {type: Boolean, default: false},

  notifications: {
    emailOn: {
      type: Boolean,
      default: true,
    },
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
    latitude: {type: Number, default: 44.494887},
    longitude: {type: Number, default: 11.3426163},
  },

  pomodoro: {
    totalStudyTime: {type: Number, default: 0},
    totalBreakTime: {type: Number, default: 0},
    settings: {
      studyDuration: {type: Number, default: 25},
      shortBreakDuration: {type: Number, default: 5},
      longBreakDuration: {type: Number, default: 15},
    },
  },

  musicPlayer: {
    songPlaying: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Song",
      default: null,
    },
    currentTime: {type: Number, default: 0},
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

  inbox: [
    {
      title: String,
      body: String,
      link: String,
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

  // url dell'immagine profilo
  avatar: String,
});
