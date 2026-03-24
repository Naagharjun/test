const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env.local' });

const MONGO_URI = process.env.MONGO_URL;

async function check() {
    await mongoose.connect(MONGO_URI);
    const Resource = mongoose.model('Resource', new mongoose.Schema({}));
    const resources = await Resource.find({});
    console.log(JSON.stringify(resources, null, 2));
    process.exit(0);
}

check().catch(err => {
    console.error(err);
    process.exit(1);
});
