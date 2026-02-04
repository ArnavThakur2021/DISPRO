const calculateGeoRisk = require("../utils/riskEngine");
const fetch = (...args) =>
    import("node-fetch").then(({ default: fetch }) => fetch(...args));

exports.getWeather = async (req, res) => {
    const { lat, lon, rvs, geo } = req.query;

    if (!lat || !lon) {
        return res.status(400).json({ error: "Missing coordinates" });
    }

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.WEATHER_KEY}`
        );

        if (!response.ok) {
            throw new Error("OpenWeather API failed");
        }

        const weather = await response.json();

        const geoRisk = calculateGeoRisk(geo); // 👈 geo-based

        res.json({
            weather,
            geoRisk,
            rvs: Number(rvs)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Weather fetch failed" });
    }
};
