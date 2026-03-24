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
const connectDB = require('./utils/db');

// In production (Vercel), we don't call app.listen() at the top level
// as Vercel handles the serverless execution.
if (process.env.NODE_ENV !== 'production') {
    connectDB()
        .then(() => {
            app.listen(PORT, '0.0.0.0', () => {
                console.log(`Server running on port ${PORT}`);
            });
        })
        .catch((error) => {
            console.error("Critical: Server failed to start due to DB issue:", error.message);
        });
} else {
    // In production (Vercel), we connect outside or rely on serverless handled connection
async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("MongoDB error:", err);
  }
}

connectDB();}

module.exports = app;

