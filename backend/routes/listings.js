const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Listing = require("../models/Listing");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/authMiddleware");

router.post("/new", verifyToken, async (req, res) => {
  try {
    const { cardId, seller, price, condition, notes } = req.body;
    console.log("Received listing data:", req.body);
    // 1. check if user already exists
    const existingUser = await User.findOne({ username: seller });

    // 3. save the user
    const newListing = new Listing({
      cardId,
      seller,
      price,
      condition,
      notes,
    });
    await newListing.save();

    res.status(201).json({ message: "Listing created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
