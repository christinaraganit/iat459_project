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
    const { listingId, buyer, location, date } = req.body;
    console.log("Received listing data:", req.body);

    const newMeetup = new Meetup({
      listingId: listingId,
      buyer,
      seller: req.userId,
      location,
      date,
    });
    console.log("Created new meetup object:", newMeetup);
    await newMeetup.save();

    res.status(201).json({ message: "Meetup created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/byListing/:listingId", verifyToken, async (req, res) => {
  try {
    console.log("Received delete request for meetup:", req.body);
    const { buyer, seller } = req.body;
    const meetup = await Meetup.findOne({
      listingId: req.params.listingId,
      buyer: buyer,
      seller: seller,
    });
    if (!meetup) {
      return res.status(404).json({ error: "Meetup not found" });
    }
    await Meetup.findByIdAndDelete(meetup._id);
    res.json({ message: "Meetup removed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/byListing/:listingId", verifyToken, async (req, res) => {
  try {
    const meetups = await Meetup.find({ listingId: req.params.listingId })
      .populate("seller", "username displayName")
      .populate("buyer", "username displayName");
    res.json(meetups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
