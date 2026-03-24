const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development';

const signToken = (user) => {
    return jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, avatar, skills, bio } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        user = new User({ name, email, password, role, avatar, skills, bio });

        // We no longer add fake mentor data here so that the Onboarding flow triggers.
        if (role === 'mentor') {
            user.totalSessions = 120;
        }

        await user.save();

        const token = signToken(user);

        // Return matching format to what the frontend expects
        const userResponse = {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            skills: user.skills,
            bio: user.bio,
            specialization: user.specialization,
            availability: user.availability,
            sessionSlots: user.sessionSlots || [],
            totalSessions: user.totalSessions,
            isBlocked: user.isBlocked
        };

        res.status(201).json({ user: userResponse, token });
    } catch (error) {
        console.error("Register err:", error);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // --- ADMIN PORTAL INTERCEPT ---
        if (email === 'admin@gmail.com' && password === 'admin') {
            const adminUser = {
                _id: 'admin_portal_id',
                name: 'Naagharjun (Admin)',
                email: 'admin@gmail.com',
                role: 'admin',
                avatar: 'https://ui-avatars.com/api/?name=Admin&background=ef4444&color=fff',
                skills: [],
                bio: 'System Administrator'
            };

            const token = signToken(adminUser);

            return res.status(200).json({
                user: { id: adminUser._id, ...adminUser },
                token
            });
        }
        // ------------------------------

        const user = await User.findOne({ email });

        if (!user || user.password !== password) {
            return res.status(400).json({ message: 'failed' });
        }

        if (user.isBlocked) {
            return res.status(403).json({ message: 'Your account has been blocked by an administrator.' });
        }

        const token = signToken(user);

        const userResponse = {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            skills: user.skills,
            bio: user.bio,
            specialization: user.specialization,
            availability: user.availability,
            sessionSlots: user.sessionSlots || [],
            totalSessions: user.totalSessions,
            isBlocked: user.isBlocked
        };

        res.status(200).json({ user: userResponse, token });
    } catch (error) {
        console.error("Login err:", error);
        res.status(500).json({ message: 'Server error' });
    }
});

const connectDB = require('../utils/db');

// POST /api/auth/google
router.post('/google', async (req, res) => {
    try {
        // Ensure DB is connected before proceeding
        await connectDB();

        const { googlePayload, role } = req.body;
        console.log("Backend received Google auth request:", { role, hasPayload: !!googlePayload });

        if (!googlePayload || !googlePayload.email) {
            console.error("Invalid Google Payload received:", googlePayload);
            return res.status(400).json({ message: "Invalid Google Payload" });
        }

        const { email, name, picture } = googlePayload;
        console.log("Processing Google Login for:", email);

        let user = await User.findOne({ email });

        if (!user) {
            // Create user
            user = new User({
                name: name || 'Google User',
                email: email,
                role: role || 'mentee',
                avatar: picture || 'https://picsum.photos/seed/google/200',
                bio: `Logged in via Google as a ${role}`
            });
            await user.save();
        }

        if (user.isBlocked) {
            return res.status(403).json({ message: 'Your account has been blocked by an administrator.' });
        }

        const token = signToken(user);

        const userResponse = {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            skills: user.skills,
            bio: user.bio,
            specialization: user.specialization,
            availability: user.availability,
            sessionSlots: user.sessionSlots || [],
            totalSessions: user.totalSessions,
            isBlocked: user.isBlocked
        };

        res.status(200).json({ user: userResponse, token });

    } catch (error) {
        console.error("CRITICAL ERROR in /google route:", error);
        
        // Specific message for Mongoose buffering timeouts (often IP Whitelist issues)
        if (error.message.includes('buffering timed out')) {
            return res.status(503).json({ 
                message: 'Database connection timeout', 
                details: 'The server was unable to connect to the database. Please ensure your MongoDB Atlas IP Whitelist is set to allow connections (0.0.0.0/0).',
                originalError: error.message
            });
        }

        res.status(500).json({ message: 'Server error during Google authentication', details: error.message });
    }
});


// GET /api/auth/me (Get Profile from Token)
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userResponse = {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            skills: user.skills,
            bio: user.bio,
            specialization: user.specialization,
            availability: user.availability,
            sessionSlots: user.sessionSlots || [],
            totalSessions: user.totalSessions,
            isBlocked: user.isBlocked
        };

        res.status(200).json(userResponse);
    } catch (error) {
        console.error("Auth Me err:", error);
        res.status(401).json({ message: 'Invalid or expired token' });
    }
});

module.exports = router;
