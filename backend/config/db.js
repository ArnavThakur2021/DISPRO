const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            tls: true,
            tlsAllowInvalidCertificates: true, // dev only
            serverSelectionTimeoutMS: 5000,
        });

        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }

};

module.exports = connectDB;