const express = require('express');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabaseClient');
const { sendOTPEmail, sendConfirmationEmail } = require('../config/emailClient');
const { rateLimit } = require('../middlewares/rateLimit');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

// Rate limiters
const otpLimiter = rateLimit({ windowMs: 60000, max: 3, message: 'Too many OTP requests. Please wait 1 minute.' });
const loginLimiter = rateLimit({ windowMs: 60000, max: 5, message: 'Too many login attempts. Please wait 1 minute.' });

// In-memory OTP store keyed by email (use Redis in production for multi-instance)
const otpStore = {};

/**
 * POST /api/auth/send-otp
 * Sends a real OTP to the user's email address.
 * Body: { email } or { email, phone }
 */
router.post('/send-otp', otpLimiter, async (req, res) => {
    const { email } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ success: false, message: 'A valid email address is required.' });
    }

    // Generate a 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    otpStore[email.toLowerCase()] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 }; // 5 min expiry

    try {
        await sendOTPEmail(email, otp);
        console.log(`📧 OTP sent to ${email}`);
        res.json({ success: true, message: 'OTP sent to your email!' });
    } catch (err) {
        console.error('EMAIL SEND ERROR:', err.message);
        console.error('EMAIL ERROR DETAILS:', { code: err.code, command: err.command, responseCode: err.responseCode });
        delete otpStore[email.toLowerCase()];
        res.status(500).json({ success: false, message: 'Failed to send OTP email. Please try again.' });
    }
});

/**
 * POST /api/auth/register
 * Validates OTP and registers the user.
 */
router.post('/register', async (req, res) => {
    try {
        const { name, college, email, phone, otp } = req.body;

        // Input validation
        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, message: 'Name is required.' });
        }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ success: false, message: 'A valid email is required.' });
        }
        if (!phone || !/^\d{10}$/.test(phone)) {
            return res.status(400).json({ success: false, message: 'A valid 10-digit phone number is required.' });
        }
        if (!otp || !/^\d{4}$/.test(otp)) {
            return res.status(400).json({ success: false, message: 'A valid 4-digit OTP is required.' });
        }

        // Validate OTP by email
        const stored = otpStore[email.toLowerCase()];
        if (!stored || stored.otp !== otp || Date.now() > stored.expiresAt) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
        }
        delete otpStore[email.toLowerCase()]; // Clear used OTP

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

        // Send confirmation email (fire-and-forget — don't block response)
        sendConfirmationEmail(newUser.email, newUser.name).catch(err =>
            console.error('CONFIRMATION EMAIL ERROR:', err.message)
        );
    } catch (err) {
        console.error('REGISTER ERROR:', err);
        res.status(500).json({ success: false, message: 'Server error: ' + err.message });
    }
});

/**
 * POST /api/auth/login
 * Step 1: Look up user by phone, send OTP to their registered email.
 */
router.post('/login', loginLimiter, async (req, res) => {
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

        if (!user.email) {
            return res.status(400).json({ success: false, message: 'No email on file. Please contact admin.' });
        }

        // Generate OTP and send via email
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        otpStore[user.email.toLowerCase()] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };

        await sendOTPEmail(user.email, otp);
        console.log(`📧 Login OTP sent to ${user.email} for phone ${phone}`);

        // Mask email for privacy: s****e@gmail.com
        const masked = user.email.replace(/^(.{1})(.*)(@.*)$/, (_, a, b, c) => a + '*'.repeat(b.length) + c);

        res.json({
            success: true,
            message: `OTP sent to ${masked}`,
            emailMasked: masked,
        });
    } catch (err) {
        console.error('LOGIN ERROR:', err);
        res.status(500).json({ success: false, message: 'Failed to send OTP. Please try again.' });
    }
});

/**
 * POST /api/auth/verify-login
 * Step 2: Verify OTP and issue JWT.
 */
router.post('/verify-login', async (req, res) => {
    try {
        const { phone, otp } = req.body;
        if (!phone || !otp) {
            return res.status(400).json({ success: false, message: 'Phone and OTP are required.' });
        }

        // Find user to get their email
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('phone', phone)
            .single();

        if (error || !user) {
            return res.status(401).json({ success: false, message: 'User not found.' });
        }

        // Validate OTP by user's email
        const stored = otpStore[user.email.toLowerCase()];
        if (!stored || stored.otp !== otp || Date.now() > stored.expiresAt) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
        }
        delete otpStore[user.email.toLowerCase()];

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
        console.error('VERIFY-LOGIN ERROR:', err);
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
