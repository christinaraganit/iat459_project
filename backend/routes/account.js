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
    const cardID = req.body;
    console.log("Adding card to wishlist:", cardID);
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

router.get("/isNewUser", verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.userId });
    res.json(user.isNewUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/displayName", verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.userId });
    res.json(user.displayName);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/rename", verifyToken, async (req, res) => {
  try {
    // 1. find user
    // console.log(req.userId);
    // console.log(req.body);
    const user = await User.findOne({ _id: req.userId });
    // console.log(user);
    user.isNewUser = false;
    console.log(req.body);
    user.displayName = req.body.displayName;
    await user.save();

    console.log(user);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
