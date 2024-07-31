import express from "express";
import cookieJwtAuth from "./middleware/cookieJwtAuth.js";

// creating a router
const router = express.Router();

// configuring routes
router.get("/ready", function (req, res) {
  // sending the response
  res.send("Server Runnign!!");
});

router.get("/dashboard", cookieJwtAuth, function (req, res) {
  // sending the response
  console.log(req.user);
  if(req.user.username === "admin@a") {
    res.send("Welcome to the admin dashboard");
  }
  res.send("You are not authorized to view this page");
});

export default router;

