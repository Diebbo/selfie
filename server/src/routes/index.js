import express from "express";
import cookieJwtAuth from "./middleware/cookieJwtAuth.js";

// creating a router
const router = express.Router();

// configuring routes
router.get("/ready", function (req, res) {
  // sending the response
  res.send("Server Runnign!!");
});

export default router;

