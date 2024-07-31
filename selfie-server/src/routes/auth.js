// routes/auth.js
import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Function to create the router with dependency injection
export function createAuthRouter(db) {
  function userCast(user) {
    return {
      _id: user._id,
      email: user.email,
      username: user.username,
      role: user.role
    };
  }
  function createToken(user) {
    return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' });
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
    const { username, password, email } = req.body;
    console.log(`User registering: ${username}`);

    const dbuser = await db.register(email, password, username, "user");

    if (!dbuser) {
      return res.status(400).json({ error: "User already exists" });
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
