module.exports = {
    locationName: "Prototype Area – North India",

    earthquake: {
        faultProximityKm: 25,
        liquefactionRisk: "medium" // low | medium | high
    },

    cyclone: {
        distanceFromCoastKm: 600,
        elevationM: 280
    },

    wildfire: {
        vegetationDensity: "low", // low | medium | high
        slopeAspect: "flat"
    },

    landslide: {
        slopeGradientDeg: 8,
        soilStability: "stable" // stable | moderate | unstable
    },

    flood: {
        distanceFromRiverKm: 1.2,
        basinType: "alluvial" // rocky | alluvial
    }
};
