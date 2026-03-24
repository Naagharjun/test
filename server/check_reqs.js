const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env.local' });

const MONGO_URI = process.env.MONGO_URL;

async function check() {
    await mongoose.connect(MONGO_URI);
    const ConnectionRequest = mongoose.model('ConnectionRequest', new mongoose.Schema({ status: String }));
    const requests = await ConnectionRequest.find({});
    console.log(JSON.stringify(requests, null, 2));
    process.exit(0);
}

check().catch(err => {
    console.error(err);
    process.exit(1);
});
