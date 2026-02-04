const { Pool } = require('pg');
require('dotenv').config();

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
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const connectDB = async () => {
  try {
    await pool.query('SELECT 1');
    console.log('PostgreSQL Connected to DISPRODB...');
  } catch (err) {
    console.error('Database Connection Failed:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
