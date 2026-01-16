const express = require('express');
const router = express.Router();
const Building = require('../models/Building');

router.post('/calculate', async (req, res) => {
    const { stories, soil, structure } = req.body;
    
    // Core Risk Analysis Logic
    let score = 5.0;
    if (stories > 3) score -= 0.5;
    if (soil === 'Soft') score -= 1.0;
    if (structure === 'Masonry') score -= 1.2;

    const newBuilding = await Building.create({ ...req.body, rvsScore: score });
    res.json(newBuilding);
});

module.exports = router;
// Route to get all buildings for a specific user
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await pool.query(
            'SELECT * FROM buildings WHERE user_id = $1 ORDER BY created_at DESC', 
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to retrieve history" });
    }
});