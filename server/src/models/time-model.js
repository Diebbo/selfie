import mongoose from "mongoose";

export const timeSchema = new mongoose.Schema({
  name: String,
  virtualTime: { type: Date, default: Date.now },
  realTimeRef: { type: Date, default: Date.now },
  isRealTime: { type: Boolean },
});
