const express = require("express");
const router = express.Router();
const Building = require("../models/Building");
const auth = require("../middleware/authMiddleware");

/* SAVE BUILDING DATA */
router.post("/save", auth, async (req, res) => {
  try {
    const building = new Building({
      userId: req.user.id,
      ...req.body
    });

    await building.save();
    res.json({ msg: "Building data saved" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/* GET USER BUILDING */
router.get("/my-building", auth, async (req, res) => {
  const building = await Building.findOne({ userId: req.user.id });
  res.json(building);
});

module.exports = router;
