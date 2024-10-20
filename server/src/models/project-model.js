import mongoose from 'mongoose';
import { activitySchema } from './event-model.js';

export const projectSchema = new mongoose.Schema({
    title: String,
    description: String,
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users'
        }
    ],
    activities: [
        activitySchema
    ],
    creationDate: Date,
    startDate: Date,
    deadline: Date,
});

