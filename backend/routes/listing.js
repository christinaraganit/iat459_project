const express = require("express");
const router = express.Router();
const Listing = require("../models/Listing");

router.get("/", async (req, res) => {
  try {
    const { search, sort, order } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { cardId: { $regex: search, $options: "i" } },
        { seller: { $regex: search, $options: "i" } },
        { notes:  { $regex: search, $options: "i" } },
      ];
    }
    const sortField = sort ?? 'createdAt';
    const sortOrder = order === "asc" ? 1 : -1;
    
    const listings = await Listing.find(query).sort({ [sortField]: sortOrder });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;