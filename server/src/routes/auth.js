// routes/auth.js
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";

const router = express.Router();

// Function to create the router with dependency injection
export function createAuthRouter(db) {
  function userCast(user) {
    return {
      _id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
      isVerified: user.isVerified,
    };
  }
  function createToken(user) {
    return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION || "1h", issuer: "selfie app" });
  }

  router.post("/login", async (req, res) => {
    const { username, email, password } = req.body;
    console.log(`User logging in: ${username || email}`);
    if (!username && !email) {
      return res.status(400).json({ error: "Username or email required" });
    }

    var dbuser;

    try {
      dbuser = await db.login({ username, email });
      console.log(`User logging in: ${dbuser.username}`);
    } catch (e) {
      console.error(e.message)
      return res.status(401).json({ message: e.message });
    }

    // check password
    if (bcrypt.compareSync(password, dbuser.password) === false) {
      return res.status(401).json({ message: "Invalid credentials" });
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
    const emailToken = crypto.randomBytes(64).toString("hex");

    var salt = bcrypt.genSaltSync(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = {
      ...req.body,
      password: hashedPassword,
      emailtoken: emailToken,
      isVerified: false,
      role: "user",
    };
    console.log(`User registering: ${newUser.username}`);

    let dbuser;

    try {
      dbuser = await db.register(newUser);
    } catch (e) {
      console.error(e.message)
      return res.status(400).json({ message: e.message });
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

  router.patch("/verifyemail", async (req, res) => {
    const emailToken = req.query.emailToken;
    if (!emailToken) {
      return res.status(400).json({ error: "No Token provided" });
    }
    try {
      const result = await db.verifyEmail(emailToken);
      return res
        .status(200)
        .json({ result, emessage: "User verified successfully" });
    } catch (e) {
      return res
        .status(400)
        .json({ error: e.message });
    }
  });

  return router;
}
