const mongoose = require("mongoose");

const WishlistItemSchema = new mongoose.Schema({
  cardId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["owned", "seeking"],
    default: "seeking",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("WishlistItem", WishlistItemSchema);
