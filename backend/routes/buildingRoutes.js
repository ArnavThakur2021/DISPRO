const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Your PostgreSQL pool

// This matches the 'Submit' button in buildingDetails.html
router.post('/save', async (req, res) => {
    try {
        const { address, latitude, longitude, rvsScore } = req.body;
        // Logic to save building details into PostgreSQL
        await pool.query(
            'INSERT INTO buildings (address, latitude, longitude, rvs_score) VALUES ($1, $2, $3, $4)',
            [address, latitude, longitude, rvsScore]
        );
        res.status(201).json({ message: "Building data saved" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// This matches the 'my-building' check in weather.js
router.get('/my-building', async (req, res) => {
    // Logic to fetch the latest building for the user
    const result = await pool.query('SELECT * FROM buildings ORDER BY created_at DESC LIMIT 1');
    res.json(result.rows[0]);
});

module.exports = router;