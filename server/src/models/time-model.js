import mongoose from "mongoose";

const timeSchema = new mongoose.Schema({
    name: String,
    time: { type: Date, default: Date.now }
});

export const Time = mongoose.model("Time", timeSchema);
