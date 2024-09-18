// database calls for the application
import { mongoose } from "mongoose";

// db Models
import { userSchema } from "./models/login-model.js";
import { timeSchema } from "./models/time-model.js";
import { eventSchema } from "./models/event-model.js";
import { noteSchema } from "./models/note-model.js";

export async function createDataBase() {
  const uri =
    "mongodb+srv://test:test@cluster0.iksyo9p.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
  
  // creating a model
  const timeModel = mongoose.model("times", timeSchema);
  const loginModel = mongoose.model("users", userSchema);
  const eventModel = mongoose.model("event", eventSchema);
  const noteModel = mongoose.model("note", noteSchema);

  mongoose.connect(uri);

  const login = async (user) => {
    var res;
    if (user.username) {
      res = await loginModel.findOne({ username: user.username });
    } else if (user.email) {
      res = await loginModel.findOne({ email: user.email });
    }

    if (!res) throw new Error("Invalid credentials");
    return res;
  };

  const register = async (user) => {
    const emailUser = await loginModel.findOne({ email: user.email });
    if (emailUser) throw new Error("Email already used");
    const usernameUser = await loginModel.findOne({ username: user.username });
    if (usernameUser) throw new Error("Username already used");

    const res = await loginModel.create({ ...user });
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
  }

  const createEvent = async(event) => {
    const res = await eventModel.create( event );
    return res; 
  }

  const createNote = async (note) => {
    const res = await noteModel.create({ note: note });
    return res;
  }

  return { login, register, changeDateTime, createEvent, createNote };
}
