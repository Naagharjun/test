const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    mentorId: { type: String, required: true },
    menteeId: { type: String, required: true },
    menteeName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.models.Review || mongoose.model('Review', reviewSchema);
