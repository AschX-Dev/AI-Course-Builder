const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();
const { OAuth2Client } = require("google-auth-library");
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClient = googleClientId ? new OAuth2Client(googleClientId) : null;

router.post("/signup", async (req, res) => {
  const { email, password, name } = req.body || {};
  if (!email || !password)
    return res.status(400).json({ error: "email and password required" });

  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ error: "email already in use" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, passwordHash, name });

  const token = jwt.sign(
    { sub: user._id.toString() },
    process.env.JWT_SECRET || "devsecret",
    {
      expiresIn: "7d",
    }
  );
  res.json({
    token,
    user: { id: user._id, email: user.email, name: user.name },
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password)
    return res.status(400).json({ error: "email and password required" });

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: "invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "invalid credentials" });

  const token = jwt.sign(
    { sub: user._id.toString() },
    process.env.JWT_SECRET || "devsecret",
    {
      expiresIn: "7d",
    }
  );
  res.json({
    token,
    user: { id: user._id, email: user.email, name: user.name },
  });
});

module.exports = router;

// Google Sign-In
router.post("/google", async (req, res) => {
  try {
    const { idToken } = req.body || {};
    if (!idToken) return res.status(400).json({ error: "idToken required" });
    if (!googleClient)
      return res.status(500).json({ error: "google client not configured" });

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: googleClientId,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email_verified)
      return res.status(401).json({ error: "unverified email" });

    const email = payload.email;
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        passwordHash: await bcrypt.hash(jwt.sign({ n: 1 }, "x"), 4),
        name: payload.name,
      });
    }
    const token = jwt.sign(
      { sub: user._id.toString() },
      process.env.JWT_SECRET || "devsecret",
      { expiresIn: "7d" }
    );
    res.json({
      token,
      user: { id: user._id, email: user.email, name: user.name },
    });
  } catch (e) {
    res.status(401).json({ error: "google auth failed" });
  }
});
