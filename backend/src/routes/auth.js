const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

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

