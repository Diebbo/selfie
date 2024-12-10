import mongoose from "mongoose";

export const noteSchema = new mongoose.Schema({
  title: String,
  content: String,
  date: Date,
  tags: [String],
});
