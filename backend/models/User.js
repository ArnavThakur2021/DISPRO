const pool = require('../config/db'); // Use your existing Postgres pool

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true }
});

module.exports = mongoose.model("User", userSchema);
const User = {
    // Function to find a user by email for login
    findByEmail: async (email) => {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        return result.rows[0];
    },

    // Function to create a new user for account setup
    create: async (email, passwordHash) => {
        const result = await pool.query(
            'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING *',
            [email, passwordHash]
        );
        return result.rows[0];
    }
};

module.exports = User;
