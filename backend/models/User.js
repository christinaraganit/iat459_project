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
  isNew: {
    type: Boolean,
    default: true,
  },
  displayName: {
    type: String,
  },
});

module.exports = mongoose.model("User", UserSchema);
