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
    type: [String],
    default: [],
  },
  listings: {
    type: [Object],
    default: [],
  },
  email: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", UserSchema);
