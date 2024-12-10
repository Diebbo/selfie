import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import pluralize from "pluralize";
import "./pushNotificationWorker.js";

// routers
import { createAuthRouter } from "./routes/auth.js";
import indexRouter from "./routes/index.js";
import createTimeRouter from "./routes/time.js";
import createCalendarRouter from "./routes/calendar.js";
import createNoteRouter from "./routes/note.js";
import { createProjectRouter } from "./routes/projects.js";
import createPomodoroRouter from "./routes/pomodoro.js";
import createMusicRouter from "./routes/musicplayer.js";
import createActivityRouter from "./routes/activities.js";
import createChatRouter from "./routes/chat.js";
import { createFriendRouter } from "./routes/friend.js";
import createUserRouter from "./routes/user.js";

export function createApp({ dirpath, database, sendNotification }) {
  // loading environment variables
  dotenv.config();

  const app = express();

  app.use(cors({ origin: "http://localhost:3000", credentials: true }));

  app.locals.pluralize = pluralize;

  app.use(logger("dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static(path.join(dirpath, "../public")));

  console.log("createApp.js: initialize routes");
  app.use("/api/", indexRouter);
  app.use("/api/auth", createAuthRouter(database, sendNotification));
  app.use("/api/config", createTimeRouter(database));
  app.use("/api/events", createCalendarRouter(database, sendNotification));
  app.use("/api/notes", createNoteRouter(database));
  app.use("/api/projects", createProjectRouter(database, sendNotification));
  app.use("/api/pomodoro", createPomodoroRouter(database));
  app.use("/api/musicplayer", createMusicRouter(database));
  app.use("/api/activities", createActivityRouter(database));
  app.use("/api/chats", createChatRouter(database));
  app.use("/api/friends", createFriendRouter(database));
  app.use("/api/users", createUserRouter(database));

  return app;
}
