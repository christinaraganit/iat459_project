const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Listing = require("../models/Listing");
const WishlistItem = require("../models/WishlistItem");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/user/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({
      _id: user._id,
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

    // user.isNewUser = false;

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

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/preferred-location", verifyToken, async (req, res) => {
  try {
    const { lat, lng, label } = req.body;

    if (
      typeof lat !== "number" ||
      Number.isNaN(lat) ||
      typeof lng !== "number" ||
      Number.isNaN(lng)
    ) {
      return res
        .status(400)
        .json({ error: "lat and lng must be valid numbers" });
    }

    const user = await User.findOne({ _id: req.userId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const normalizedLabel =
      typeof label === "string" && label.trim().length > 0
        ? label.trim()
        : `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

    user.preferredLocation = {
      type: "Point",
      coordinates: [lng, lat],
      label: normalizedLabel,
      updatedAt: new Date(),
    };
    user.isNewUser = false;

    await user.save();

    res.status(200).json({ preferredLocation: user.preferredLocation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/preferred-location", verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.userId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user.preferredLocation || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/interest", verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.userId }).populate(
      "listingsOfInterest",
    );

    res.json(user.listingsOfInterest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new listing
router.post("/interest/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

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

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

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
