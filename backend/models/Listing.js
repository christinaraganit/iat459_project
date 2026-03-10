const mongoose = require("mongoose");

const ListingSchema = new mongoose.Schema({
    cardId: {
      type: String,
      required: true,
    },
    seller: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    condition: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
    },
    images: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      required: true,
    }
  }, {
    timestamps: true
  });

module.exports = mongoose.model("Listing", ListingSchema);