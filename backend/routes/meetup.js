const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Listing = require("../models/Listing");
const Meetup = require("../models/Meetup");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { verifyToken } = require("../middleware/authMiddleware");

// Create a new meetup
router.post("/new", verifyToken, async (req, res) => {
  try {
    const { listingId, buyer, location, time } = req.body;
    console.log("Received listing data:", req.body);

    const newMeetup = new Meetup({
      listingId,
      buyer,
      seller: req.userId,
      location,
      time,
    });
    await newMeetup.save();

    res.status(201).json({ message: "Meetup created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
