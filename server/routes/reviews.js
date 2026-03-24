const express = require('express');
const mongoose = require('mongoose');
const Review = require('../models/Review');
const ConnectionRequest = require('../models/ConnectionRequest');

const router = express.Router();

// GET /api/reviews (Global reviews for Admin)
router.get('/', async (req, res) => {
    try {
        const reviews = await Review.find({}).sort({ createdAt: -1 });
        res.status(200).json(reviews);
    } catch (error) {
        console.error("Get All Reviews Err:", error);
        res.status(500).json({ message: 'Server error fetching all reviews' });
    }
});

// GET /api/reviews/:mentorId
router.get('/:mentorId', async (req, res) => {
    try {
        const { mentorId } = req.params;
        const reviews = await Review.find({ mentorId }).sort({ createdAt: -1 });
        res.status(200).json(reviews);
    } catch (error) {
        console.error("Get Reviews Err:", error);
        res.status(500).json({ message: 'Server error fetching reviews' });
    }
});

// POST /api/reviews
router.post('/', async (req, res) => {
    try {
        const { mentorId, menteeId, menteeName, rating, comment } = req.body;

        // Verify connection exists and is accepted
        const connection = await ConnectionRequest.findOne({
            mentorId,
            menteeId,
            status: 'accepted'
        });

        if (!connection) {
            return res.status(403).json({ message: 'You can only review mentors you have an accepted connection with.' });
        }

        // Check if review already exists
        const existingReview = await Review.findOne({ mentorId, menteeId });
        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this mentor.' });
        }

        const newReview = new Review({
            mentorId,
            menteeId,
            menteeName,
            rating,
            comment
        });

        await newReview.save();
        res.status(201).json(newReview);
    } catch (error) {
        console.error("Post Review Err:", error);
        res.status(500).json({ message: 'Server error saving review' });
    }
});

module.exports = router;
