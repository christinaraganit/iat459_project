const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Listing = require("../models/Listing");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { verifyToken } = require("../middleware/authMiddleware");

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

router.get("/user/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({
      username: user.username,
      displayName: user.displayName,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/isNewUser", verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.userId });
    console.log(user.isNewUser);
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
    const user = await User.findOne({ _id: req.userId });
    // console.log(user);
    user.isNewUser = false;
    console.log(req.body);
    user.displayName = req.body.displayName;
    await user.save();
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        role: user.role,
      },
      process.env.JWT_SECRET || "fallbackSecret",
      { expiresIn: "1h" },
    );
    console.log(user);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/interest", verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.userId }).populate(
      "listingsOfInterest",
    );
    console.log("User's listings of interest:", user.listingsOfInterest);
    res.json(user.listingsOfInterest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new listing
router.post("/interest/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Adding interesting listing:", id);

    const listing = await Listing.findById(id);
    console.log("Found listing:", listing);
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    console.log("Found user:", user);
    console.log(user.listingsOfInterest);
    if (user.listingsOfInterest.includes(id)) {
      return res.status(400).json({ error: "Listing already in interests" });
    }
    user.listingsOfInterest.push(id);
    await user.save();

    res.status(201).json({ message: "Interest added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/interest/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Removing interesting listing:", id);

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    console.log("Found user:", user);
    user.listingsOfInterest = user.listingsOfInterest.filter(
      (listingId) => listingId.toString() !== id,
    );
    await user.save();

    res.json({ message: "Interest removed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
