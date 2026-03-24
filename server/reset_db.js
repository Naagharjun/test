const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();
async function resetDB() {
    try {
        const mongoUrl = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/mentorlink';
        console.log(`Connecting to ${mongoUrl}...`);
        await mongoose.connect(mongoUrl);
        
        console.log("Dropping database 'mentorlink'...");
        await mongoose.connection.db.dropDatabase();
        
        console.log("SUCCESS: Database reset completed.");
    } catch (error) {
        console.error("ERROR: Failed to reset database:", error.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

resetDB();
