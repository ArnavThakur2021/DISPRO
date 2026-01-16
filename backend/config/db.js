const { Pool } = require('pg');
require('dotenv').config();

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