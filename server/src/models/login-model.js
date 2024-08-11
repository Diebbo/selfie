import { mongoose } from "mongoose";

export const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String,

    name: String,
    surname: String,
    phoneNumber: String,
    birthDate: Date,

    address: String,
    city: String,
    state: String,
    zip: String,
    country: String,

    role: String,
});
