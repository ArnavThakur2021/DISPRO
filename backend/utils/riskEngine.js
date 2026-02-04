const geo = require("../config/geographyProfile");

function calculateGeoRisk() {
    let risk = {
        earthquake: 0,
        cyclone: 0,
        flood: 0,
        landslide: 0,
        wildfire: 0
    };

    // Earthquake
    if (geo.earthquake.faultProximityKm < 30) risk.earthquake += 0.6;
    if (geo.earthquake.liquefactionRisk === "high") risk.earthquake += 0.7;
    if (geo.earthquake.liquefactionRisk === "medium") risk.earthquake += 0.4;

    // Cyclone
    if (geo.cyclone.distanceFromCoastKm < 50) risk.cyclone += 0.8;
    if (geo.cyclone.elevationM < 10) risk.cyclone += 0.6;

    // Flood
    if (geo.flood.distanceFromRiverKm < 1) risk.flood += 0.9;
    if (geo.flood.basinType === "alluvial") risk.flood += 0.4;

    // Landslide
    if (geo.landslide.slopeGradientDeg > 20) risk.landslide += 0.8;
    if (geo.landslide.soilStability === "unstable") risk.landslide += 0.6;

    // Wildfire
    if (geo.wildfire.vegetationDensity === "high") risk.wildfire += 0.7;

    return risk;
}

module.exports = calculateGeoRisk;
