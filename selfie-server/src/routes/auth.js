// routes/auth.js
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const router = express.Router();

// Function to create the router with dependency injection
export function createAuthRouter(db) {
  function userCast(user) {
    return {
      _id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
    };
  }
  function createToken(user) {
    return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1h" });
  }

  router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    console.log(`User logging in: ${username}`);

    const dbuser = await db.login(username, password);

    if (!dbuser) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = userCast(dbuser);

    const token = createToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "Lax",
      // secure: true, // Enable in production
      // maxAge: 3600000, // 1 hour
      // signed: true, // Enable if using signed cookies
    });

    res.json({ user, token });
  });

  router.post("/register", async (req, res) => {
    const password = req.body.password;

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      ...req.body,
      password: hashedPassword,
      role: "user",
    };
    console.log(`User registering: ${newUser.username}`);

    var dbuser;

    try {
      dbuser = await db.register(newUser);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }

    const user = userCast(dbuser);

    const token = createToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "Lax",
      // secure: true, // Enable in production
      // maxAge: 3600000, // 1 hour
      // signed: true, // Enable if using signed cookies
    });

    res.json({ user, token });
  });

  return router;
}
