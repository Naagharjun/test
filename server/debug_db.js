const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();
async function debugDB() {
    try {
        const mongoUrl = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/mentorlink';
        console.log(`Connecting to ${mongoUrl}...`);
        await mongoose.connect(mongoUrl);
        
        const admin = mongoose.connection.db.admin();
        const dbs = await admin.listDatabases();
        console.log("Databases:", JSON.stringify(dbs, null, 2));
        
        const dbName = mongoose.connection.db.databaseName;
        console.log("Current DB:", dbName);
        
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log("Collections in current DB:", collections.map(c => c.name));
        
    } catch (error) {
        console.error("ERROR:", error.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

debugDB();
