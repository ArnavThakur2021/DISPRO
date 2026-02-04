const mongoose = require("mongoose");

const buildingSchema = new mongoose.Schema({
    userId: String,

    address: String,
    lat: Number,
    lon: Number,
    geo: String,

    stories: Number,
    yearBuilt: Number,
    soil: String,
    plan: String,
    structureType: String,

    rvsScore: Number,
    seismicZone: String,

    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Building", buildingSchema);
