import { mongoose } from "mongoose";

import { activitySchema } from "./event-model.js";

export const userSchema = new mongoose.Schema({
    //campi user di default per l'iscrizione
    username: String,
    password: String,
    email: String,

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
    events: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
    }],

    //eventi a cui ho accettato la partecipazione
    participatingEvents: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Event' 
    }], 

    //eventi pendenti
    invitedEvents: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Event' 
    }],

    notes: [{
        title: String,
        content: String,
        date: Date,
        tags: [String]
    }],

    position: {
        latitude: Number,
        longitude: Number
    },

    pomodoro: {
        totalStudyTime: Number,
        totalBreakTime: Number,
        settings: {
            studyDuration: Number,
            shortBreakDuration: Number,
            longBreakDuration: Number
        }
    },

    musicPlayer: {
        currentSong: String,
        currentTime: Number,
        likedSongs: [String] 
    },

    activities: [
        activitySchema
    ],
    
    //campi per risorse
    resource: {
        maxPartecipants: Number, //numero massimo di partecipanti
        claimant: {
            type: mongoose.Schema.Types.ObjectId, //chi ha prenotato risorsa
            ref: 'User'
            },
        booked: Boolean,
        date: [Date] //date in cui la risorsa è prenotata
    },

    
    // lista di notifiche
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

    // progetti a cui partecipo
    projects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    }],

});

