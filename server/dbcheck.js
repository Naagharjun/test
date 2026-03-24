const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env.local' });
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URL)
    .then(async () => {
        const mentors = await User.find({ role: 'mentor' });
        console.log(mentors.map(m => ({ name: m.name, lastActive: m.lastActive })));
        process.exit(0);
    });
