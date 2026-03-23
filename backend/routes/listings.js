const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Listing = require("../models/Listing");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/authMiddleware");

// View all listings
router.get("/", async (req, res) => {
  try {
    const { search, sort, order, condition } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { cardId: { $regex: search, $options: "i" } },
        { seller: { $regex: search, $options: "i" } },
        { notes: { $regex: search, $options: "i" } },
      ];
      query.$and = [{ seller: { $regex: search, $options: "i" } }];
    }
    if (condition) {
      const conditions = Array.isArray(condition) ? condition : [condition];
      query.condition = { $in: conditions };
    }
    const sortField = sort ?? "createdAt";
    const sortOrder = order === "asc" ? 1 : -1;

    const listings = await Listing.find(query)
      .skip(2)
      .limit(4)
      .populate("seller", "username displayName")
      .sort({ [sortField]: sortOrder });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/currentUser", verifyToken, async (req, res) => {
  try {
    const listings = await Listing.find({ seller: req.userId });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/user/:user", async (req, res) => {
  try {
    const seller = await User.findOne({ username: req.params.user });
    console.log(seller);
    if (!seller) {
      return res.status(404).json({ error: "User not found" });
    }
    const listings = await Listing.find({ seller: seller._id });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/item/:id", async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate(
      "seller",
      "username displayName",
    );
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }
    res.json(listing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new listing
router.post("/new", verifyToken, async (req, res) => {
  try {
    const { cardId, price, condition, notes } = req.body;
    console.log("Received listing data:", req.body);
    // console.log(req);
    // 3. save the user
    const newListing = new Listing({
      cardId,
      seller: req.userId,
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
