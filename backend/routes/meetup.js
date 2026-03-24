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

router.get("/byId/:id", verifyToken, async (req, res) => {
  try {
    const meetup = await Meetup.findById(req.params.id)
      .populate("seller", "username displayName id")
      .populate("buyer", "username displayName id")
      .populate("listingId", "_id cardId price condition notes");
    if (
      meetup.seller.id.toString() !== req.userId &&
      meetup.buyer.id.toString() !== req.userId
    ) {
      return res.status(403).json({ error: "Forbidden" });
    }
    console.log(meetup);
    if (!meetup) {
      return res.status(404).json({ error: "Meetup not found" });
    }
    res.json(meetup);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/myMeetups", verifyToken, async (req, res) => {
  try {
    const meetups = await Meetup.find({
      $or: [{ seller: req.userId }, { buyer: req.userId }],
    })
      .populate("seller", "username displayName id")
      .populate("buyer", "username displayName id")
      .populate("listingId", "_id cardId price condition notes");
    res.json(meetups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/status", verifyToken, async (req, res) => {
  try {
    const { meetupId, status } = req.body;
    console.log("Received status update request:", req.body);
    const meetup = await Meetup.findById(meetupId);
    if (!meetup) {
      return res.status(404).json({ error: "Meetup not found" });
    }
    if (
      meetup.seller.toString() !== req.userId &&
      meetup.buyer.toString() !== req.userId
    ) {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (status === "accepted") {
      if (meetup.buyer.toString() !== req.userId) {
        return res.status(403).json({
          error: "Only the buyer can confirm a meetup",
        });
      }

      const seller = await User.findById(meetup.seller);
      const preferredLocation = seller?.preferredLocation;
      const hasCoordinates =
        Array.isArray(preferredLocation?.coordinates) &&
        preferredLocation.coordinates.length === 2 &&
        typeof preferredLocation.coordinates[0] === "number" &&
        typeof preferredLocation.coordinates[1] === "number";

      if (!hasCoordinates) {
        return res.status(400).json({
          error: "Seller has no preferred meeting location set",
        });
      }

      const [lng, lat] = preferredLocation.coordinates;
      const label = preferredLocation.label?.trim();
      meetup.location = label || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }

    meetup.status = status;
    await meetup.save();
    res.json({ message: "Meetup status updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
