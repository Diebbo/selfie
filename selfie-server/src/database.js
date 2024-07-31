// database calls for the application
import { mongoose } from 'mongoose';
import { loginSchema } from './models/login-model.js';

export async function createDataBase() {
  const uri = "mongodb+srv://test:test@cluster0.iksyo9p.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

  const loginModel = mongoose.model('login', loginSchema);

  mongoose.connect(uri);

  const login = async (email, password) => {
    const user = await loginModel.findOne({ email, password });

    return user ? user : null;
  };

  const register = async (email, password, username, role) => {
    const dbUser = await loginModel.findOne({ email });
    if (dbUser) return null;

    const user = await loginModel.create({ email, password, username, role });
    return user;
  }

  return { login, register };
}
