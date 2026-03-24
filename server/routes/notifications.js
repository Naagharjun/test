const express = require('express');
const Notification = require('../models/Notification');

const router = express.Router();

// GET /api/notifications/user/:userId
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(20);
        
        const formatted = notifications.map(n => ({
            id: n._id.toString(),
            userId: n.userId,
            message: n.message,
            type: n.type,
            relatedId: n.relatedId,
            isRead: n.isRead,
            timestamp: new Date(n.createdAt).getTime()
        }));
        
        res.status(200).json(formatted);
    } catch (error) {
        console.error("Get Notifications Err:", error);
        res.status(500).json({ message: 'Server error fetching notifications' });
    }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
        if (!updated) return res.status(404).json({ message: 'Notification not found' });
        
        res.status(200).json({ id: updated._id.toString(), isRead: updated.isRead });
    } catch (error) {
        console.error("Mark Read Err:", error);
        res.status(500).json({ message: 'Server error updating notification' });
    }
});

// DELETE /api/notifications/user/:userId/clear (Optional: clear all)
router.delete('/user/:userId/clear', async (req, res) => {
    try {
        const { userId } = req.params;
        await Notification.deleteMany({ userId });
        res.status(200).json({ message: 'Notifications cleared' });
    } catch (error) {
        console.error("Clear Notifications Err:", error);
        res.status(500).json({ message: 'Server error clearing notifications' });
    }
});

module.exports = router;
