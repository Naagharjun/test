const express = require('express');
const Resource = require('../models/Resource');

const router = express.Router();

// GET /api/resources?mentorId=...
router.get('/', async (req, res) => {
    try {
        const { mentorId } = req.query;
        const query = mentorId ? { mentorId } : {};
        const resources = await Resource.find(query).sort({ createdAt: -1 });
        const formattedResources = resources.map(r => ({
            id: r._id.toString(),
            mentorId: r.mentorId,
            title: r.title,
            description: r.description,
            url: r.url,
            type: r.type,
            createdAt: r.createdAt
        }));
        res.status(200).json(formattedResources);
    } catch (error) {
        console.error("Get Resources Err:", error);
        res.status(500).json({ message: 'Server error fetching resources' });
    }
});

// POST /api/resources
router.post('/', async (req, res) => {
    try {
        const { mentorId, title, description, url, type } = req.body;
        const newResource = new Resource({
            mentorId,
            title,
            description,
            url,
            type
        });
        await newResource.save();
        res.status(201).json({
            id: newResource._id.toString(),
            mentorId: newResource.mentorId,
            title: newResource.title,
            description: newResource.description,
            url: newResource.url,
            type: newResource.type,
            createdAt: newResource.createdAt
        });
    } catch (error) {
        console.error("Post Resource Err:", error);
        res.status(500).json({ message: 'Server error saving resource' });
    }
});

// DELETE /api/resources/:id
router.delete('/:id', async (req, res) => {
    try {
        await Resource.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Resource deleted' });
    } catch (error) {
        console.error("Delete Resource Err:", error);
        res.status(500).json({ message: 'Server error deleting resource' });
    }
});

module.exports = router;
