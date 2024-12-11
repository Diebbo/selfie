import express from "express";
import cookieJwtAuth from "./middleware/cookieJwtAuth.js";

function createTimeRouter(db) {
  const router = express.Router();

  router.post("/time", cookieJwtAuth, function (req, res, next) {
    if (!req.body.date) {
      return res.status(400).json({ message: "Time required" });
    }

    try {
      db.changeDateTime(req.body.date);
      console.log("Time has been changed to", req.body.date);
      res
        .status(200)
        .json({ message: `Time has been changed to ${req.body.date}` });
    } catch (error) {
      res.status(500).json({ message: "Error changing time" });
    }
  });

  router.delete("/time", cookieJwtAuth, function (req, res, next) {
    try {
      db.changeDateTime(null, true);
      console.log("Time has been reset to real time");
      res.status(200).json({ message: "Time has been reset to real time" });
    } catch (error) {
      res.status(500).json({ message: "Error resetting time" });
    }
  });

  router.get("/time", cookieJwtAuth, async function (req, res, next) {
    try {
      const currentTime = await db.getDateTime();
      res.status(200).json(currentTime.toISOString());
    } catch (error) {
      res.status(500).json({ message: "Error getting current time" });
    }
  });

  return router;
}

export default createTimeRouter;
