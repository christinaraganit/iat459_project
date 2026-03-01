const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/authMiddleware");

// Get wishlist
router.get("/wishlist/:id", verifyToken, async (req, res) => {
  try {
    // 1. find user
    const user = await User.findOne({ username: req.params.id });
    res.json(user.wishlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/wishlist/:id", verifyToken, async (req, res) => {
  try {
    // 0. check if user is modifying their own wishlist
    if (req.params.id !== req.username)
      return res.status(403).json({ error: "Forbidden" });
    // 1. find user
    console.log(req.userId);
    const user = await User.findOne({ username: req.params.id });
    // 2. get cardID from body
    const { cardID } = req.body;
    // 2. add card to wishlist
    user.wishlist.push(req.body.cardId);
    await user.save();
    res.json(user.wishlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/wishlist/:id/:index", verifyToken, async (req, res) => {
  try {
    // 0. check if user is modifying their own wishlist
    if (req.params.id !== req.username)
      return res.status(403).json({ error: "Forbidden" });
    // 1. find user
    console.log(req.userId);
    const user = await User.findOne({ username: req.params.id });

    user.wishlist = user.wishlist.filter(
      (_, i) => i !== parseInt(req.params.index),
    );
    await user.save();
    res.json(user.wishlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
