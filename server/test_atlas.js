const { MongoClient } = require("mongodb");
require('dotenv').config();
// Use environment variable instead of hardcoded credentials
const uri = process.env.MONGO_URL;

const client = new MongoClient(uri);

async function run() {
  try {
    console.log("Attempting to connect to MongoDB Atlas...");
    await client.connect();
    console.log("✅ Connected to MongoDB");

  } catch (err) {
    console.error("❌ Connection failed:");
    console.error(err);
  } finally {
    await client.close();
    console.log("Connection closed.");
  }
}

run();
