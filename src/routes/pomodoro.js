import express from "express";
import cookieJwtAuth from "./middleware/cookieJwtAuth.js";

function createPomodoroRouter(db) {
  const router = express.Router();

  router.post("/settings", cookieJwtAuth, async (req, res) => {
    const uid = req.user._id;
    console.log("uid", uid)
    const settings = req.body.settings;

    try {
      const updatedSettings = await db.setPomodoroSettings(uid, settings);
      res.status(200).json({
        message: "Pomodoro settings updated",
        settings: updatedSettings,
      });
    } catch (err) {
      console.log("bomba")
      res.status(400).json({ message: err.message });
    }
  });

  router.get("/settings", cookieJwtAuth, async (req, res) => {
    const uid = req.user._id;

    try {
      const user = await db.getUserById(uid);
      res.status(200).json(user.pomodoro.settings);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });

  router.patch("/update", cookieJwtAuth, async (req, res) => {
    const uid = req.user._id;
    const incStudyTime = req.body.pomodoro.totalStudyTime;
    const incBreakTime = req.body.pomodoro.totalBreakTime;

    try {
      const user = await db.getUserById(uid);
      if (!user.pomodoro){
        user.pomodoro = {
          totalStudyTime: 0,
          totalBreakTime: 0
      }
      }
      let studyTime = user.pomodoro.totalStudyTime;
      let breakTime = user.pomodoro.totalBreakTime;

      user.pomodoro.totalStudyTime = incStudyTime + studyTime;
      user.pomodoro.totalBreakTime = incBreakTime + breakTime;
      const updatedUser = await user.save();
      res.status(200).json({
        message: "Pomodoro time updated",
        pomodoro: updatedUser.pomodoro,
      });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });

  router.get("/stats", cookieJwtAuth, async (req, res) => {
    const uid = req.user._id;

    try {
      const user = await db.getUserById(uid);
      const totalStudy = user.pomodoro.totalStudyTime;
      const totalBreak = user.pomodoro.totalBreakTime;
      res.status(200).json({
        totalStudyTime: totalStudy,
        totalBreakTime: totalBreak,
      });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });


  return router;
}

export default createPomodoroRouter;
