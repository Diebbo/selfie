import express from "express";
import cookieJwtAuth from "./middleware/cookieJwtAuth.js";

export default function createUserRouter(db) {
  const router = express.Router();

  router.get("/usernames", async (_, res) => {
    try {
      const usernames = await db.userService.getAllUsernames();
      return res.status(200).json({message: "get successuflly", usernames});
    } catch (error) {
      return res.status(404).json({ message: error.message });
    }
  });

  router.get("/id", cookieJwtAuth, async (req, res) => {
    try {
      const dbuser = (await db.userService.getById(req.user._id)).toObject();
      // const events = await db.getEvents(req.user._id);
      const friends = await db.friendService.get(req.user._id);

      const user = { ...dbuser, friends };

      return res.status(200).json(user);
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

  router.get("/gps", cookieJwtAuth, async (req, res) => {
    try {
      const gps = await db.userService.getGps(req.user._id);
      return res.status(200).json(gps);
    } catch (error) {
      return res.status(404).json({ message: error.message });
    }
  });

  return router;
}
