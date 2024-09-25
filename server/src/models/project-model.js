import mongoose from 'mongoose';
import { activitySchema } from './event-model.js'

export const projectSchema = new mongoose.Schema({
    title: String,
    description: String,
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    activities: [
        activitySchema
    ],
    creationDate: Date,
    deadline: Date,
});

