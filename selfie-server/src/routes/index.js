const express = require("express");
const cookieJwtAuth = require("./middleware/cookieJwtAuth");

// creating a router
const router = express.Router();

// configuring routes
router.get("/", function (req, res) {
  console.log("request", req)
  console.log("response", res)
  // sending the response
  res.send("Hello Express!!");
});

router.get("/about", cookieJwtAuth, function (req, res) {
  // sending the response
  res.send("About Us");
});

module.exports = router;

