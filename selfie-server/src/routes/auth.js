// routes/auth.js
const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

// Example fetch data function
async function getData(username) {
  return { username: "user@gmail.com", password: "password" };
}

// Example authentication route
// router.get("/login", (req, res) => {
//   res.render("login");
// });

router.post("/login", async (req, res) => {
  // Add your authentication logic here
  const { username, password } = req.body;
  console.log("this mf is loggin in:" + username + " " + password);

  const user = await getData(username);

  // Dummy authentication check
  if (password !== user.password) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  delete user.password;

  const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1h" });

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "Lax",
    // secure: true, // Enable in production
    // maxAge: 3600000, // 1 hour
    // signed: true, // Enable if using signed cookies
  });

  res.json({ user, token });
});

module.exports = router;
