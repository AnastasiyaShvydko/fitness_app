// server/routes/auth.js
const router = require('express').Router();
const passport = require('passport');
const bcrypt = require("bcrypt");
const User = require("../models/User"); // your MongoDB User model
const requireAdmin = require('../middleware/requireAdmin'); // middleware to check admin access

// Redirect to Google for login
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

// Handle the callback after Google login
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
  FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

  res.redirect(FRONTEND_URL); // or your frontend URL
  });
//

router.get('/user', (req, res) => {
  res.set("Cache-Control", "no-store");
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});
// Logout
router.get('/logout', (req, res) => {
  req.logout(err => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Logout failed' });
    }

    req.session.destroy(err => {
      if (err) {
        console.error(err);
      }
        res.clearCookie("connect.sid", {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: false,
      });// Important for cookie removal
    
      const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

      res.redirect(FRONTEND_URL);
    });
  });
});

// Get current user
// router.get('/user', (req, res) => {
//   res.send(req.user || null);
// });


// Signup route
router.post('/signup', async (req, res) => {
  try {
    const { displayName, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      displayName,
      email,
      password: hashedPassword
    });

    await newUser.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating account" });
  }
});

// Login route
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Successful login — you can send user info or a token
      req.login(user, (err) => {
      if (err) return next(err);
      res.json({ message: "Login successful", user: { displayName: user.displayName, email: user.email, isAdmin: user.isAdmin } });
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post('/admin-action', requireAdmin, (req, res) => {
  // admin-only logic
});


module.exports = router;
