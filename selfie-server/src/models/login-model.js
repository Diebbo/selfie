import { mongoose } from 'mongoose';

export const loginSchema = new mongoose.Schema({
    email: String,
    password: String,
    username: String,
    role: String,
});


