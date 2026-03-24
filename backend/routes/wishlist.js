const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Listing = require("../models/Listing");
const WishlistItem = require("../models/WishlistItem");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { verifyToken } = require("../middleware/authMiddleware");
// Get wishlist
router.get("/:id", async (req, res) => {
  console.log("Received request for wishlist of user:", req.params.id);
  try {
    // 1. find user
    const user = await User.findOne({ username: req.params.id }).populate(
      "wishlist",
      "cardId status",
    );
    res.json(user.wishlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/add", verifyToken, async (req, res) => {
  try {
    // 0. check if user is modifying their own wishlist
    const user = await User.findById(req.userId);
    console.log(user);
    // 2. get cardID from body
    const wishlistItem = new WishlistItem({
      cardId: req.body.cardId,
    });
    console.log("Creating wishlist item:", wishlistItem);
    // 2. add card to wishlist
    user.wishlist.push(wishlistItem);
    await user.save();
    await wishlistItem.save();
    res.json({ wishlist: user.wishlist, newItem: wishlistItem });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/remove", verifyToken, async (req, res) => {
  try {
    // 0. check if user is modifying their own wishlist

    // 1. find user
    const user = await User.findById(req.userId);
    const wishlistItem = await WishlistItem.findById(req.body.id);
    if (!wishlistItem) {
      return res.status(404).json({ error: "Wishlist item not found" });
    }
    console.log("User found for wishlist removal:", user);
    user.wishlist = user.wishlist.filter(
      (item) => item._id.toString() !== req.body.id,
    );
    await user.save();
    await WishlistItem.findByIdAndDelete(req.body.id);
    res.json({ wishlist: user.wishlist, removedItem: wishlistItem });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/status", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate(
      "wishlist",
      "cardId status _id",
    );
    console.log(user.wishlist);
    console.log(req.body.wishlistItemId);
    // 2. update status of wishlist item
    const itemInUserWishlist = user.wishlist.find(
      (i) => i._id.toString() === req.body.wishlistItemId,
    );
    console.log("item found:", itemInUserWishlist);
    if (!itemInUserWishlist)
      return res.status(404).json({ error: "Wishlist item not found" });
    const wishlistItemToUpdate = await WishlistItem.findById(
      req.body.wishlistItemId,
    );
    wishlistItemToUpdate.status = req.body.status;
    await wishlistItemToUpdate.save();
    await user.save();
    res.json(user.wishlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
