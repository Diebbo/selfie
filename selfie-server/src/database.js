// database calls for the application
import { mongoose } from "mongoose";
import { userSchema } from "./models/login-model.js";

export async function createDataBase() {
  const uri =
    "mongodb+srv://test:test@cluster0.iksyo9p.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

  const loginModel = mongoose.model("users", userSchema);

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

  return { login, register };
}
