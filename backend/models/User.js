const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true, // no two users can have the same name
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["member", "admin"],
    default: "member",
    required: true,
  },
  isNewUser: {
    type: Boolean,
    default: true,
  },
  displayName: {
    type: String,
    default: "",
  },
  wishlist: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "WishlistItem",
    default: [],
  },
  listings: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Listing",
    default: [],
  },
  listingsOfInterest: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Listing",
    default: [],
  },
  email: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  preferredLocation: {
    type: Object,
  },
  rating: {
    type: Number,
    default: -1,
  },
});

module.exports = mongoose.model("User", UserSchema);
