// database calls for the application
import { mongoose } from "mongoose";

export async function createDataBase(schemas) {
  const uri =
    "mongodb+srv://test:test@cluster0.iksyo9p.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
  
  // creating a model
  const timeModel = mongoose.model("time", schemas.timeSchema);
  const loginModel = mongoose.model("users", schemas.userSchema);
  const eventModel = mongoose.model("event", schemas.eventSchema);

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
    const res = await timeModel.findOneAndUpdate({}, { time: time });
    return res;
  }

  const createEvent = async(event) => {
    const res = await eventModel.create( event );
    return res; 
  }

  return { login, register, changeDateTime, createEvent };
}
