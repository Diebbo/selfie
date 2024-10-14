import mongoose from 'mongoose';

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
    activities: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Activity'
    }],
    creationDate: Date,
    startDate: Date,
    deadline: Date,
});

