const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const User = require("../models/User");
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

// Get all reviews (admin only)
router.get("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const reviews = await Review.find({})
      .populate("reviewer", "username displayName")
      .populate("reviewee", "username displayName")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all reviews for a specific user (by username)
router.get("/user/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const reviews = await Review.find({ reviewee: user._id })
      .populate("reviewer", "username displayName")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit a review
router.post("/", verifyToken, async (req, res) => {
  try {
    const { revieweeId, score, comment } = req.body;

    if (!revieweeId || !score) {
      return res.status(400).json({ error: "Reviewee and score are required" });
    }

    if (req.userId === revieweeId) {
      return res.status(400).json({ error: "You cannot review yourself" });
    }

    const reviewee = await User.findById(revieweeId);
    if (!reviewee) {
      return res.status(404).json({ error: "Reviewee not found" });
    }

    const newReview = new Review({
      reviewer: req.userId,
      reviewee: revieweeId,
      score,
      comment,
    });

    await newReview.save();
    res.status(201).json({ message: "Review submitted successfully" });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "You have already reviewed this user" });
    }
    res.status(500).json({ error: err.message });
  }
});

// Edit a review
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    const isReviewer = review.reviewer.toString() === req.userId;
    const isAdmin = req.role === "admin";
    if (!isReviewer && !isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { score, comment } = req.body;
    if (score !== undefined) review.score = score;
    if (comment !== undefined) review.comment = comment;

    await review.save();
    res.json({ message: "Review updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a review
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    if (review.reviewer.toString() !== req.userId && req.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: "Review deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
