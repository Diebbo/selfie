const express = require("express");
const cookieJwtAuth = require("./middleware/cookieJwtAuth");

// creating a router
const router = express.Router();

// configuring routes
router.get("/ready", function (req, res) {
  // sending the response
  res.send("Server Runnign!!");
});

router.get("/about", cookieJwtAuth, function (req, res) {
  // sending the response
  res.send("About Us");
});

module.exports = router;

