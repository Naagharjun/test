const { MongoClient } = require("mongodb");

const uri = process.env.MONGO_URL;

let client;
let clientPromise;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

module.exports = async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db("myDB");

    res.status(200).json({ message: "✅ DB Connected" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
