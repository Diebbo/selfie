import mongoose from 'mongoose';

const projectActivitySchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true,
        index: true
    },
    creationDate: { type: Date, default: Date.now },
    startDate: Date,
    dueDate: Date,
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed'],
        default: 'pending',
        index: true
    },
    input: [{ type: String, trim: true }],
    output: [{ type: String, trim: true }],
    comments: [
        {
            creator: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Users',
                required: true
            },
            comment: { type: String, trim: true },
            date: { type: Date, default: Date.now }
        }
    ],
    assignees: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users',
            index: true
        }
    ]
}, { timestamps: true }); 

export const projectSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true,
        index: true
    },
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users',
            index: true
        }
    ],
    activities: [projectActivitySchema],
    creationDate: { type: Date, default: Date.now },
    startDate: Date,
    deadline: Date
}, { timestamps: true }); 

export default mongoose.model('Project', projectSchema);
