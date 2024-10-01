import mongoose from 'mongoose';

export const songSchema = new mongoose.Schema({
    title: String,
    artist: String,
    album: String,
    year: Number,
    genre: String,
    duration: Number,
});