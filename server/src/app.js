import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";
import httpErrors from "http-errors";
const { createError } = httpErrors;
import dotenv from "dotenv";
import pluralize from "pluralize";
import bodyParser from "body-parser";

// routers 
import { createAuthRouter } from "./routes/auth.js";
import indexRouter from "./routes/index.js";
import createTimeRouter from "./routes/time.js";
import createCalendarRouter from "./routes/calendar.js";
import createNoteRouter from "./routes/note.js";

export function createApp({ dirpath, database }) {
  // loading environment variables
  dotenv.config();

  const app = express();

  // middelewares
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.use(cors({ origin: "http://localhost:3000", credentials: true }));

  app.locals.pluralize = pluralize;

  app.use(logger("dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static(path.join(dirpath, "../public")));

  console.log("createApp.js: initialize routes");
  app.use("/api/", indexRouter);
  app.use("/api/auth", createAuthRouter(database));
  app.use("/api/config", createTimeRouter(database));
  app.use("/api/calendar", createCalendarRouter(database));
  app.use("/api/notes", createNoteRouter(database));

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    next(createError(404));
  });

  // error handler
  app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
  });

  return app;
}
