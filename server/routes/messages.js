const express = require('express');
const mongoose = require('mongoose');

// We use mongoose.model to ensure we get the correctly registered models
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

const Message = require('../models/Message');
const ConnectionRequest = require('../models/ConnectionRequest');

const router = express.Router();

// POST /api/messages/upload
router.post('/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        
        const fileUrl = `/uploads/${req.file.filename}`;
        const fileType = req.file.mimetype.startsWith('image/') ? 'image' : 'document';
        
        res.status(200).json({ url: fileUrl, type: fileType });
    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ message: 'Error uploading file' });
    }
});

// GET /api/messages/:requestId
router.get('/:requestId', async (req, res) => {
    try {
        const { requestId } = req.params;
        const MessageModel = mongoose.model('Message');
        const messages = await MessageModel.find({ requestId }).sort({ createdAt: 1 });
        const mappedMessages = messages.map(m => ({
            ...m.toObject(),
            id: m._id
        }));
        res.status(200).json(mappedMessages);
    } catch (error) {
        console.error("Get Messages Err:", error);
        res.status(500).json({ message: 'Server error fetching messages' });
    }
});

// POST /api/messages
router.post('/', async (req, res) => {
    try {
        const { requestId, senderId, recipientId, content, fileUrl, fileType } = req.body;
        console.log(`[CHAT] New message attempt: [${typeof requestId}] req=${requestId} sender=${senderId} file=${!!fileUrl}`);

        const ConnectionModel = mongoose.model('ConnectionRequest');
        const MessageModel = mongoose.model('Message');

        // Verify the connection exists and is accepted
        const connection = await ConnectionModel.findById(requestId);
        if (!connection) {
            console.warn(`[CHAT] Connection not found: ${requestId}`);
            return res.status(404).json({ message: 'Connection not found' });
        }

        if (connection.status !== 'accepted') {
            console.warn(`[CHAT] Connection not accepted: ${requestId} status=${connection.status}`);
            return res.status(403).json({ message: 'Can only chat on accepted connections' });
        }

        const newMessage = new MessageModel({
            requestId,
            senderId,
            recipientId,
            content,
            fileUrl,
            fileType
        });

        await newMessage.save();
        console.log(`[CHAT] Message saved successfully: ${newMessage._id}`);
        res.status(201).json({
            ...newMessage.toObject(),
            id: newMessage._id
        });
    } catch (error) {
        console.error("Post Message Err:", error);
        res.status(500).json({ message: 'Server error sending message', details: error.message });
    }
});

// PATCH /api/messages/read/:requestId
router.patch('/read/:requestId', async (req, res) => {
    try {
        const { requestId } = req.params;
        const { userId } = req.body;
        console.log(`[CHAT] Marking messages as read: req=${requestId} user=${userId}`);

        const MessageModel = mongoose.model('Message');
        await MessageModel.updateMany(
            { requestId, recipientId: userId, read: false },
            { $set: { read: true } }
        );

        res.status(200).json({ message: 'Messages marked as read' });
    } catch (error) {
        console.error("Mark Read Err:", error);
        res.status(500).json({ message: 'Server error marking messages as read' });
    }
});

module.exports = router;
