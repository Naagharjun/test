const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth.js');
const requestRoutes = require('./routes/requests.js');
const userRoutes = require('./routes/users.js');
const messageRoutes = require('./routes/messages.js');
const reviewRoutes = require('./routes/reviews.js');
const resourceRoutes = require('./routes/resources.js');
const adminRoutes = require('./routes/admin.js');
const notificationRoutes = require('./routes/notifications.js'); // Added notificationRoutes

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/admin', adminRoutes);
app.get('/api/db-status', require('./api/db_status'));


// Database Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URL;

if (!MONGO_URI) {
    console.error("MONGO_URL is missing in .env.local!");
    process.exit(1);
}

if (process.env.NODE_ENV !== 'production') {
    mongoose.connect(MONGO_URI, {
        serverApi: {
            version: '1',
            strict: true,
            deprecationErrors: true,
        }
    })
        .then(() => {
            console.log("Connected to MongoDB");
            app.listen(PORT, '0.0.0.0', () => {
                console.log(`Server running on port ${PORT}`);
            });
        })
        .catch((error) => {
            console.error("Error connecting to MongoDB:", error.message);
        });
} else {
    // In production (Vercel), we connect outside or rely on serverless handled connection
    mongoose.connect(MONGO_URI).catch(err => console.error("MongoDB production error:", err));
}

module.exports = app;

