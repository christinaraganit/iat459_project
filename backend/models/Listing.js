const mongoose = require("mongoose");

const ListingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  cardId: {
    type: String,
    required: true,
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  condition: {
    type: String,
  },
  notes: {
    type: String,
  },
  images: {
    type: [String],
    default: [],
  },
  status: {
    type: String,
    enum: ["active", "pending", "sold"],
    default: "active",
  },
  interestedUsers: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
    default: [],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Listing", ListingSchema);
