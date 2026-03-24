const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const Request = require('../models/ConnectionRequest');
const Review = require('../models/Review');
const Resource = require('../models/Resource');

const router = express.Router();

// GET /api/admin/status
router.get('/status', async (req, res) => {
    try {
        const dbStatus = mongoose.connection.readyState;
        
        const counts = {
            users: await User.countDocuments(),
            requests: await Request.countDocuments(),
            reviews: await Review.countDocuments(),
            resources: await Resource.countDocuments()
        };

        res.status(200).json({
            connected: dbStatus === 1,
            state: dbStatus,
            counts,
            dbName: mongoose.connection.name,
            timestamp: new Date()
        });
    } catch (error) {
        console.error("Admin Status Error:", error);
        res.status(500).json({ message: 'Error fetching system status' });
    }
});

// PATCH /api/admin/users/:id/toggle-block
router.patch('/users/:id/toggle-block', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Cannot block an administrator' });
        }

        user.isBlocked = !user.isBlocked;
        await user.save();

        res.status(200).json({
            id: user._id.toString(),
            name: user.name,
            isBlocked: user.isBlocked
        });
    } catch (error) {
        console.error("Toggle Block Error:", error);
        res.status(500).json({ message: 'Error toggling user block status' });
    }
});

module.exports = router;
