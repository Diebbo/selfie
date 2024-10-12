// routes/auth.js
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import cookieJwtAuth from "./middleware/cookieJwtAuth.js";
import { sendPushNotification } from "../../pushNotificationWorker.js";

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
    return jwt.sign(user, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION || "1h",
      issuer: "selfie app",
    });
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
      console.error(e.message);
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
      secure: false,
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
      console.error(e.message);
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
      const dbuser = await db.verifyEmail(emailToken);

      const user = userCast(dbuser);

      const token = createToken(user);

      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "Lax",
        // secure: true, // Enable in production
        // maxAge: 3600000, // 1 hour
        // signed: true, // Enable if using signed cookies
      });

      return res.status(200).json({ user, token });
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  });

  // Endpoint to check if the user is verified
  router.get("/isVerified", cookieJwtAuth, async (req, res) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      if (user.isVerified) {
        return res.status(200).json({ message: "User is verified" });
      } else {
        return res.status(401).json({ message: "User is not verified" });
      }
    } catch (e) {
      return res.status(401).json({ message: e.message });
    }
  });

  // Funzione che ritorna la email dell'utente loggato usando il middleware cookieJwtAuth
  router.get("/email", cookieJwtAuth, async (req, res) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    return res.status(200).json({ email: user.email });
  });

  router.get("/username", cookieJwtAuth, async (req, res) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    return res.status(200).json({ username: user.username });
  });

  router.post("/subscription", cookieJwtAuth, async (req, res) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const subscription = req.body;
    console.log(subscription);
    try {
      await db.saveSubscription(user._id, subscription);
      return res.status(200).json({ message: "Subscription saved" });
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }
  });

  router.delete("/subscription", cookieJwtAuth, async (req, res) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      await db.deleteSubscription(user._id);
      return res.status(200).json({ message: "Subscription deleted" });
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }
  });

  router.get("/send-test-notification", cookieJwtAuth, async (req, res) => {
    console.log("Sending test notification");
    try {
      const subscription = await db.getSubscription(req.user._id);
      console.log("Subscription:", subscription);
      const payload = {
        title: "Test Notification",
        body: "This is a server-side test notification",
      };

      await sendPushNotification(subscription, payload);
      res.status(200).json({ message: "Notification sent successfully" });
    } catch (error) {
      console.error("Error in send-test-notification:", error);
      res
        .status(500)
        .json({ error: error.message || "Failed to send notification" });
    }
  });

  return router;
}
