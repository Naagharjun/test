const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'ConnectionRequest', required: true },
    senderId: { type: String, required: true },
    recipientId: { type: String, required: true },
    content: { type: String, required: true },
    fileUrl: { type: String },
    fileType: { type: String },
    read: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.models.Message || mongoose.model('Message', messageSchema);
