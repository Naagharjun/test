const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ['mentor', 'mentee', 'admin'], required: true },
    avatar: { type: String },
    skills: [{
        name: { type: String },
        proficiency: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' }
    }],
    bio: { type: String },
    education: { type: String },
    experience: { type: String },
    interests: [{ type: String }],
    password: { type: String }, // Optional since Google auth might not use it immediately

    specialization: { type: String },
    availability: [{ type: String }],
    lastActive: { type: Date, default: Date.now },
    sessionSlots: [{
        date: { type: String },
        time: { type: String },
        available: { type: Number, default: 1 }
    }],
    totalSessions: { type: Number, default: 0 },
    isBlocked: { type: Boolean, default: false }
}, { timestamps: true });

// Check if model exists to prevent OverwriteModelError during hot reloads
module.exports = mongoose.models.User || mongoose.model('User', userSchema);
