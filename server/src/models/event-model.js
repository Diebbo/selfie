//modello evento

import { mongoose } from "mongoose";

export const eventSchema = new mongoose.Schema({

  //BEGIN:VCALENDAR
  //VERSION:2.0
  //PRODID:-//ZContent.net//Zap Calendar 1.0//EN
  //CALSCALE:GREGORIAN
  //METHOD:PUBLISH
  //BEGIN:VEVENT
  summary: String,
  uid: Number, 
  sequence: Number,
  status: String, 
  transp: String, 
  rrule: {freq: String, interval: Number, bymonth: Number, bymonthday: Number},
  dstart: Date,
  dtend: Date,
  dtstamp: String,
  categories: [String],
  location: String,
  geo: [Number],
  description: String,
  URL: String,
  //END:VEVENT
  //END:VCALENDAR

});
