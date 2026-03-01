const express = require('express');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabaseClient');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

// In-memory OTP store (for demo; replace with Redis/SMS service in production)
const otpStore = {};

/**
 * POST /api/auth/send-otp
 * Sends a mock OTP to the user's phone number.
 */
router.post('/send-otp', (req, res) => {
    const { phone } = req.body;
    if (!phone) {
        return res.status(400).json({ success: false, message: 'Phone number is required.' });
    }

    // Generate a 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    otpStore[phone] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 }; // 5 min expiry

    console.log(`📲 OTP for ${phone}: ${otp}`); // Log for dev; in production, send via SMS

    res.json({ success: true, message: 'OTP sent successfully.', otp_hint: otp }); // Remove otp_hint in production
});

/**
 * POST /api/auth/register
 * Validates OTP and registers the user.
 */
router.post('/register', async (req, res) => {
    try {
        const { name, college, email, phone, otp } = req.body;

        // Validate OTP
        const stored = otpStore[phone];
        if (!stored || stored.otp !== otp || Date.now() > stored.expiresAt) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
        }
        delete otpStore[phone]; // Clear used OTP

        // Check if user already exists
        const { data: existing } = await supabase
            .from('users')
            .select('id')
            .eq('phone', phone)
            .single();

        if (existing) {
            return res.status(400).json({ success: false, message: 'Phone number already registered.' });
        }

        // Insert new user
        const { data: newUser, error } = await supabase
            .from('users')
            .insert([{ name, college, email, phone, role: 'student' }])
            .select()
            .single();

        if (error) throw error;

        // Generate JWT
        const token = jwt.sign(
            { id: newUser.id, phone: newUser.phone, role: 'student' },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            success: true,
            message: 'Registration successful!',
            token,
            user: { id: newUser.id, name: newUser.name, email: newUser.email, phone: newUser.phone },
        });
    } catch (err) {
        console.error('REGISTER ERROR:', err);
        res.status(500).json({ success: false, message: 'Server error: ' + err.message });
    }
});

/**
 * POST /api/auth/login
 * Logs in a user via phone number (after OTP verification in a real app).
 */
router.post('/login', async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) {
            return res.status(400).json({ success: false, message: 'Phone number is required.' });
        }

        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('phone', phone)
            .single();

        if (error || !user) {
            return res.status(401).json({ success: false, message: 'User not found. Please register first.' });
        }

        const token = jwt.sign(
            { id: user.id, phone: user.phone, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Welcome back!',
            token,
            user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
        });
    } catch (err) {
        console.error('LOGIN ERROR:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// ───────────────────────────────────────────────────
// GET /api/auth/profile
// Get the logged-in user's profile
// ───────────────────────────────────────────────────
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/profile', verifyToken, async (req, res) => {
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', req.user.id)
            .single();

        if (error || !user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        res.json({ success: true, user });
    } catch (err) {
        console.error('PROFILE FETCH ERROR:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch profile.' });
    }
});

// ───────────────────────────────────────────────────
// PUT /api/auth/profile
// Update the logged-in user's profile
// ───────────────────────────────────────────────────
router.put('/profile', verifyToken, async (req, res) => {
    try {
        const { name, email, college } = req.body;
        const updates = {};
        if (name !== undefined) updates.name = name;
        if (email !== undefined) updates.email = email;
        if (college !== undefined) updates.college = college;

        const { data: updated, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', req.user.id)
            .select()
            .single();

        if (error) throw error;

        res.json({ success: true, message: 'Profile updated!', user: updated });
    } catch (err) {
        console.error('PROFILE UPDATE ERROR:', err);
        res.status(500).json({ success: false, message: 'Failed to update profile.' });
    }
});

module.exports = router;
