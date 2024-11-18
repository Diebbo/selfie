import express from "express";
import cookieJwtAuth from "./middleware/cookieJwtAuth.js";

export default function createUserRouter(db) {
  const router = express.Router();

  router.get("/usernames", async (_, res) => {
    try {
      const usernames = await db.userService.getAllUsernames();
      return res.status(200).json({ message: "get successuflly", usernames });
    } catch (error) {
      return res.status(404).json({ message: error.message });
    }
  });


  router.get("/id", cookieJwtAuth, async (req, res) => {
    try {
      const dbuser = await db.userService.getById(req.user._id);
      return res.status(200).json(dbuser);
    } catch (error) {
      return res.status(404).json({ message: error.message });
    }
  });

  router.post("/gps", cookieJwtAuth, async (req, res) => {
    try {
      const response = await db.userService.updateGps(req.user._id, req.body);
      return res.status(200).json(response);
    } catch (error) {
      return res.status(404).json({ message: error.message });
    }
  });

  router.get("/usernames/:username", cookieJwtAuth, async (req, res) => {
    try {
      const user = await db.userService.getByUsername(req.params.username);
      return res.status(200).json(user);
    } catch (error) {
      return res.status(404).json({ message: error.message });
    }
  });

  router.get("/gps", cookieJwtAuth, async (req, res) => {
    try {
      const gps = await db.userService.getGps(req.user._id);
      return res.status(200).json(gps);
    } catch (error) {
      return res.status(404).json({ message: error.message });
    }
  });

  router.get("/inbox", cookieJwtAuth, async (req, res) => {
    try {
      const notifications = await db.getInbox(req.user._id);
      return res.status(200).json(notifications);
    } catch (error) {
      return res.status(404).json({ message: error.message });
    }
  });

  router.delete("/inbox", cookieJwtAuth, async (req, res) => {
    try {
      const response = await db.deleteInbox(req.user._id);
      return res.status(200).json(response);
    } catch (error) {
      return res.status(404).json({ message: error.message });
    }
  });

  router.delete("/inbox/:id", cookieJwtAuth, async (req, res) => {
    try {
      const response = await db.deleteInboxById(req.user._id, req.params.id);
      return res.status(200).json(response);
    } catch (error) {
      return res.status(404).json({ message: error.message });
    }
  });

  router.patch("/inbox/link", cookieJwtAuth, async (req, res) => {
    console.log("Request body:", req.body); // Aggiungi questo

    try {
      const link = req.body.link;
      const response = await db.deleteInboxByLink(req.user._id, link);
      return res.status(200).json(response);
    } catch (error) {
      return res.status(404).json({ message: error.message });
    }
  });

  router.patch("/avatar", cookieJwtAuth, async (req, res) => {
    try {
      const response = await db.userService.changeAvatar(req.user._id, req.body.avatar);
      if (!response) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.status(200).json(response);
    } catch (error) {
      return res.status(404).json({ message: error.message });
    }
  });

  router.get("/admin", cookieJwtAuth, async (req, res) => {
    try {
      const response = await db.isAdmin(req.user._id);
      console.log(response);
      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  });


  return router;
}
