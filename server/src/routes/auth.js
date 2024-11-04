// routes/auth.js
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import cookieJwtAuth from "./middleware/cookieJwtAuth.js";

const router = express.Router();

// Function to create the router with dependency injection
export function createAuthRouter(db, sendNotification) {
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

    let dbuser, payload;

    try {
      const res = await db.register(newUser);
      dbuser = res.dbuser;
      payload = res.payload;
    } catch (e) {
      console.error(e.message);
      return res.status(400).json({ message: e.message });
    }

    // add Email to inbox
    //await db.addNotificationToInbox(dbuser._id, payload);
    await sendNotification(dbuser, payload);

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

  router.delete("/account", cookieJwtAuth, async (req, res) => {
    const user = req.user;
    const { password } = req.body;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const dbuser = await db.getUserById(user._id);
      if (bcrypt.compareSync(password, dbuser.password) === false) {
        return res.status(400).json({ message: "Invalid password" });
      }
      await db.deleteAccount(user._id);
      res.clearCookie("token");
      return res.status(200).json({ message: "Account deleted" });
    } catch (e) {
      console.log(e.message);
      return res.status(400).json({ error: e.message });
    }
  });

  router.patch("/email", cookieJwtAuth, async (req, res) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const email = req.body.email;
    const emailToken = crypto.randomBytes(64).toString("hex");
    try {
      const dbuser = await db.updateEmail(user._id, email, emailToken);
      const newuser = userCast(dbuser);
      const token = createToken(newuser);

      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "Lax",
        // secure: true, // Enable in production
        // maxAge: 3600000, // 1 hour
        // signed: true, // Enable if using signed cookies
      });

      return res.status(200).json({ newuser, token });
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  });

  router.patch("/username", cookieJwtAuth, async (req, res) => {
    console.log("Updating username");
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const username = req.body.username;
    try {
      const dbuser = await db.updateUsername(user._id, username);

      const newuser = userCast(dbuser);
      const token = createToken(newuser);

      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "Lax",
        // secure: true, // Enable in production
        // maxAge: 3600000, // 1 hour
        // signed: true, // Enable if using signed cookies
      });

      return res.status(200).json({ newuser, token });
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  });

  router.patch("/password", cookieJwtAuth, async (req, res) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { currentPassword, newPassword } = req.body;

    try {
      // Verifica la password corrente
      const dbUser = await db.getUserById(user._id);
      const isPasswordCorrect = await bcrypt.compare(
        currentPassword,
        dbUser.password,
      );

      if (!isPasswordCorrect) {
        return res
          .status(400)
          .json({ message: "Current password is incorrect" });
      }

      // Genera il nuovo hash per la nuova password
      const salt = bcrypt.genSaltSync(10);
      const hashedNewPassword = await bcrypt.hash(newPassword, salt);

      // Aggiorna la password
      const tmp = await db.updatePassword(user._id, hashedNewPassword);
      const newuser = userCast(tmp);
      const token = createToken(newuser);

      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "Lax",
        // secure: true, // Enable in production
        // maxAge: 3600000, // 1 hour
        // signed: true, // Enable if using signed cookies
      });

      return res.status(200).json({ newuser, token });
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
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
      const result = await db.isVerified(user._id);
      return res.status(200).json({ isVerified: result });
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

    try {
      const isNew = await db.saveSubscriptions(user._id, subscription);
      if (isNew)
        return res.status(200).json({ message: "Subscribed successfully!" });
      else
        return res.status(200).json({ message: "Updated name of this device" });
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }
  });

  router.delete("/subscription", cookieJwtAuth, async (req, res) => {
    const user = req.user;
    const device_name = req.body.device_name;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      await db.deleteSubscription(user._id, device_name);
      return res.status(200).json({ message: "Subscription deleted" });
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }
  });

  router.get("/subscriptions", cookieJwtAuth, async (req, res) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const subscriptions = await db.getSubscriptions(user._id);
      return res.status(200).json({ subscriptions });
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }
  });

  router.get("/notifications", cookieJwtAuth, async (req, res) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const notifications = await db.getNotificationsStatus(user._id);
      return res.status(200).json(notifications);
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }
  });

  router.patch("/notifications/:type", cookieJwtAuth, async (req, res) => {
    const user = req.user;
    const type = req.params.type;
    const enable = req.body.enable;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      if (enable) {
        await db.enableNotifications(user._id, type);
      } else if (!enable) {
        await db.disableNotifications(user._id, type);
      } else {
        return res.status(400).json({ message: "Invalid request" });
      }
      return res.status(200).json({ message: "Notifications deleted" });
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }
  });

  // FOR TESTING PURPOSES
  router.get("/send-test-notification", cookieJwtAuth, async (req, res) => {
    console.log("Sending test notification");
    try {
      const user = await db.userService.getById(req.user._id);

      const payload = {
        title: "Test Notification",
        body: "This is a server-side test notification",
        link: "https://site232454.tw.cs.unibo.it/",
      };

      //await sendNotification(user, payload);
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
