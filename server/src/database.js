// database calls for the application
import { mongoose } from "mongoose";

// db Models
import { userSchema } from "./models/user-model.js";
import { timeSchema } from "./models/time-model.js";
import { eventSchema } from "./models/event-model.js";
import { projectSchema } from "./models/project-model.js";
import { songSchema } from "./models/song-model.js";

export async function createDataBase() {
  const uri =
    "mongodb+srv://test:test@cluster0.iksyo9p.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

  // creating a model
  const timeModel = mongoose.model("Times", timeSchema);
  const userModel = mongoose.model("Users", userSchema);
  const eventModel = mongoose.model("Event", eventSchema);
  const songModel = mongoose.model("Song", songSchema);
  const projectModel = mongoose.model("Projects", projectSchema);

  mongoose.connect(uri);

  const login = async (user) => {
    var res;
    if (user.username) {
      res = await userModel.findOne({ username: user.username });
    } else if (user.email) {
      res = await userModel.findOne({ email: user.email });
    }

    if (!res) throw new Error("Invalid credentials");
    return res;
  };

  const register = async (user) => {
    const emailUser = await userModel.findOne({ email: user.email });
    if (emailUser) throw new Error("Email already used");
    const usernameUser = await userModel.findOne({ username: user.username });
    if (usernameUser) throw new Error("Username already used");

    const res = await userModel.create({ ...user });
    return res;
  };

  const changeDateTime = async (time) => {
    let filter = { name: "timemachine" };
    let update = { time: time };
    const res = await timeModel.findOneAndUpdate(filter, update, {
      new: true,
      upsert: true,
    });
    return res;
  };

  const createEvent = async (event) => {
    const res = await eventModel.create(event);
    return res;
  };

  const createNote = async (uid, note) => {
    try {
      const user = await userModel.findById(uid);
      if (!user) throw new Error("User not found");

      // Validate note object
      if (!note.title || !note.content) {
        throw new Error("Note must have a title and content");
      }

      // Add current date if not provided
      if (!note.date) {
        note.date = new Date();
      }

      user.notes.push(note);
      const updatedUser = await user.save();
      
      let num_notes = updatedUser.notes.length;
      return updatedUser.notes[num_notes - 1]; // Return the newly added note
    } catch (error) {
      console.error("Error creating note:", error);
      throw error;
    }
  };

  const setPomodoroSettings = async (uid, settings) => {
    try {
      const user = await userModel.findById(uid);
      if (!user) throw new Error("User not found");

      if (
        !settings.studyDuration ||
        !settings.shortBreakDuration ||
        !settings.longBreakDuration
      ) {
        throw new Error(
          "Settings must have studyDuration, shortBreakDuration, and longBreakDuration"
        );
      }

      user.pomodoro.settings = settings;
      const updatedUser = await user.save();
      return updatedUser.pomodoro.settings;
    } catch (error) {
      console.error("Error setting pomodoro settings:", error);
      throw error;
    }
  };

  const getUserById = async (uid) => {
    try {
      const user = await userModel.findById(uid);
      if (!user) throw new Error("User not found");
      return user;
    } catch (error) {
      console.error("Error getting user by ID:", error);
      throw error;
    }
  };

  const get = async () => {
    try {
      const songs = await songModel.find({});
      return songs;
    } catch (error) {
      console.error("Error getting songs:", error);
      throw error;
    }
  };

  const getCurrentSong = async (uid) => {
    try {
      const user = await userModel.findById(uid);
      if (!user) throw new Error("User not found");

      const song = await songModel.findById(user.musicPlayer.songPlaying);
      if (!song) throw new Error("Song not found");

      return song;
    } catch (error) {
      console.error("Error getting current song:", error);
      throw error;
    }
  };

  return { login, register, changeDateTime, createEvent, createNote, setPomodoroSettings, getUserById };
}
