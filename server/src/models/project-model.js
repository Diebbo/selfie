import mongoose from 'mongoose';

export const projectSchema = new mongoose.Schema({
    name: String,
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
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Activity'
        }
    ],
    time: { type: Date, default: Date.now },
    deadline: Date,
});

