import mongoose from 'mongoose';
import { activitySchema } from './event-model.js';

export const projectSchema = new mongoose.Schema({
    title: String,
    description: String,
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    members: [
        String // Array of user usernames
    ],
    activities: [
        activitySchema
    ],
    creationDate: Date,
    startDate: Date,
    deadline: Date,
});

