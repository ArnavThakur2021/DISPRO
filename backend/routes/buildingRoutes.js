const express = require("express");
const router = express.Router();
const Building = require("../models/Building");

router.post("/save", async (req, res) => {
    const data = req.body;

    const existing = await Building.findOne({ userId: data.userId });

    if (existing) {
        Object.assign(existing, data);
        await existing.save();
        return res.json(existing);
    }

    const building = new Building(data);
    await building.save();
    res.json(building);
});

router.get("/:userId", async (req, res) => {
    const building = await Building.findOne({ userId: req.params.userId });
    res.json(building);
});

module.exports = router;
