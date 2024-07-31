// routes/auth.js
import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Function to create the router with dependency injection
export function createAuthRouter(db) {
  // Example fetch data function
  async function getData(username, password) {
    return await db.login(username, password);
  }

  // Example authentication route
  router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    console.log(`User logging in: ${username}`);

    const user = await getData(username, password);

    if (!user || password !== user.password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    delete user.password;

    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1h" });

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
