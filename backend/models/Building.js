const mongoose = require("mongoose");

const BuildingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  address: String,
  latitude: Number,
  longitude: Number,

  stories: Number,
  yearBuilt: Number,
  planShape: String,
  soilType: String,
  condition: String,
  structureType: String,

  buildingUse: String,
  occupants: Number,

  seismicZone: String,
  rvsScore: Number,

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Building", BuildingSchema);
