import mongoose from "mongoose";

export const timeSchema = new mongoose.Schema({
    name: String,
    time: { type: Date, default: Date.now }
});
