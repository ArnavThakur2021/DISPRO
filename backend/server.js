require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const weatherRoutes = require("./routes/weatherRoutes");
const buildingRoutes = require("./routes/buildingRoutes");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/weather", weatherRoutes);
app.use("/api/building", buildingRoutes);

app.listen(process.env.PORT, () =>
    console.log(`Server running on port ${process.env.PORT}`)
);
