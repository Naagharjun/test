const mongoose = require('mongoose');

const mongoUrl = process.env.MONGO_URL;

if (!mongoUrl) {
    console.error("CRITICAL: MONGO_URL is missing in environment variables!");
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development and multiple function invocations in serverless environments.
 */
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
    if (!mongoUrl) {
        throw new Error("MONGO_URL environment variable is not defined");
    }

    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: true,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 10000, // 10 seconds timeout
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        };

        console.log("Connecting to MongoDB...");
        cached.promise = mongoose.connect(mongoUrl, opts).then((mongoose) => {
            console.log("✅ Successfully connected to MongoDB");
            return mongoose;
        }).catch(err => {
            console.error("❌ MongoDB connection error:", err.message);
            cached.promise = null; // Reset promise so we can try again
            throw err;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

module.exports = connectDB;
