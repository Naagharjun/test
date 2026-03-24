const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    mentorId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    url: { type: String, required: true },
    type: { type: String, enum: ['link', 'document', 'video', 'other'], default: 'link' },
}, { timestamps: true });

module.exports = mongoose.models.Resource || mongoose.model('Resource', resourceSchema);
