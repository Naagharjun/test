const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // Recipient of the notification
    message: { type: String, required: true },
    type: { type: String, enum: ['request', 'status_change', 'message'], required: true },
    relatedId: { type: String }, // e.g., ConnectionRequest ID
    isRead: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
