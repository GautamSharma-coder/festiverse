const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const supabase = require('../config/supabaseClient');
const { sendOTPEmail, sendConfirmationEmail } = require('../config/emailClient');
const { rateLimit } = require('../middlewares/rateLimit');
const { isValidEmail, isValidPhone, enforceMaxLength, isGmailOnly } = require('../middlewares/sanitize');
const { config } = require('../config/env');
const logger = require('../config/logger');

const router = express.Router();
const JWT_SECRET = config.jwt.secret; // Validated at startup via env.js

// Rate limiters
const otpLimiter = rateLimit({ windowMs: 60000, max: 3, message: 'Too many OTP requests. Please wait 1 minute.' });
const loginLimiter = rateLimit({ windowMs: 60000, max: 5, message: 'Too many login attempts. Please wait 1 minute.' });
const registerLimiter = rateLimit({ windowMs: 60000, max: 3, message: 'Too many registration attempts. Please wait 1 minute.' });

const authService = require('../services/authService');
const userService = require('../services/userService');

/**
 * Generate a unique Festiverse ID.
 * Format: F26 + first letter of first name + first letter of last name + 4-digit random number
 * Example: "Gautam Sharma" → F26GS4821
 */
function generateFestiverseId(fullName) {
    const parts = fullName.trim().split(/\s+/);
    const firstInitial = (parts[0]?.[0] || 'X').toUpperCase();
    const lastInitial = (parts.length > 1 ? parts[parts.length - 1][0] : 'X').toUpperCase();
    const randomNum = crypto.randomInt(1000, 9999);
    return `F26${firstInitial}${lastInitial}${randomNum}`;
}

/**
 * POST /api/auth/send-otp
 * Sends a real OTP to the user's email address.
 * Body: { email } or { email, phone }
 */
router.post('/send-otp', otpLimiter, async (req, res) => {
    try {
        const { email } = req.body;
        if (!email || !isValidEmail(email)) {
            return res.status(400).json({ success: false, message: 'Only Gmail addresses (@gmail.com) are accepted.' });
        }
        await authService.sendOTP(email);
        res.json({ success: true, message: 'OTP sent to your email!' });
    } catch (err) {
        logger.error('SEND OTP ERROR', { message: err.message });
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
});

/**
 * POST /api/auth/register
 * Validates OTP and registers the user.
 */
router.post('/register', registerLimiter, async (req, res) => {
    try {
        const result = await authService.register(req.body);

        // Set JWT as httpOnly cookie (matching legacy behavior)
        res.cookie('festiverse_token', result.token, {
            httpOnly: true,
            secure: config.isProduction,
            sameSite: config.isProduction ? 'none' : 'lax',
            path: '/',
            maxAge: 24 * 60 * 60 * 1000,
        });

        res.status(201).json({
            success: true,
            message: 'Registration successful!',
            user: result.user
        });
    } catch (err) {
        logger.error('REGISTER ERROR', { message: err.message });
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
});

/**
 * POST /api/auth/login
 * Login with phone and password.
 */
router.post('/login', loginLimiter, async (req, res) => {
    try {
        const { phone, password } = req.body;
        if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
            return res.status(400).json({ success: false, message: 'A valid 10-digit Indian phone number is required.' });
        }
        if (!password || typeof password !== 'string' || password.length > 128) {
            return res.status(400).json({ success: false, message: 'A valid password is required.' });
        }

        const { data: user, error } = await supabase
            .from('users')
            .select('id, name, email, phone, college, role, has_paid, avatar_url, festiverse_id, password_hash')
            .eq('phone', phone)
            .single();

        if (error || !user) {
            // Be generic for security
            return res.status(401).json({ success: false, message: 'Invalid phone number or password.' });
        }

        if (!user.password_hash) {
            return res.status(401).json({ success: false, message: 'Account registered before passwords were required. Please contact admin.' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid phone number or password.' });
        }

        // Issue JWT token
        const token = jwt.sign(
            { id: user.id, phone: user.phone, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Set JWT as httpOnly cookie
        res.cookie('festiverse_token', token, {
            httpOnly: true,
            secure: config.isProduction,
            sameSite: config.isProduction ? 'none' : 'lax',
            path: '/',
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
        });

        res.json({
            success: true,
            message: 'Welcome back!',
            user: { id: user.id, name: user.name, email: user.email, phone: user.phone, festiverse_id: user.festiverse_id },
        });
    } catch (err) {
        logger.error('LOGIN ERROR', { message: err.message });
        res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
});

/**
 * POST /api/auth/forgot-password-otp
 * Sends an OTP to the user's email if they forgot their password.
 */
router.post('/forgot-password-otp', otpLimiter, async (req, res) => {
    try {
        const { email } = req.body;
        if (!email || !isValidEmail(email)) {
            return res.status(400).json({ success: false, message: 'Only Gmail addresses (@gmail.com) are accepted.' });
        }
        await authService.sendOTP(email, 'reset_');
        res.json({ success: true, message: 'If an account exists with this email, an OTP has been sent.' });
    } catch (err) {
        logger.error('FORGOT PASSWORD OTP ERROR', { message: err.message });
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
});

/**
 * POST /api/auth/reset-password
 * Resets the password using the OTP sent to the user's email.
 */
router.post('/reset-password', otpLimiter, async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !isValidEmail(email)) {
            return res.status(400).json({ success: false, message: 'Only Gmail addresses (@gmail.com) are accepted.' });
        }
        if (!newPassword || newPassword.length < 10 || newPassword.length > 128) {
            return res.status(400).json({ success: false, message: 'Password must be 10-128 characters.' });
        }
        await authService.resetPassword(email, otp, newPassword);
        res.json({ success: true, message: 'Password has been reset successfully. You can now log in.' });
    } catch (err) {
        logger.error('RESET PASSWORD ERROR', { message: err.message });
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
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
            .select('id, name, email, phone, college, role, has_paid, avatar_url, festiverse_id, created_at')
            .eq('id', req.user.id)
            .single();

        if (error || !user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        res.json({ success: true, user });
    } catch (err) {
        logger.error('PROFILE FETCH ERROR', { message: err.message });
        res.status(500).json({ success: false, message: 'Failed to fetch profile.' });
    }
});

// ───────────────────────────────────────────────────
// PUT /api/auth/profile
// Update the logged-in user's profile (supports avatar upload)
// ───────────────────────────────────────────────────
const multer = require('multer');
const pathModule = require('path');
const avatarUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 1 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|webp|gif/;
        const ext = allowed.test(pathModule.extname(file.originalname).toLowerCase());
        const mime = allowed.test(file.mimetype);
        if (ext && mime) return cb(null, true);
        cb(new Error('Only image files are allowed.'));
    },
});

router.put('/profile', verifyToken, avatarUpload.single('avatar'), async (req, res) => {
    try {
        const { name, email, otp } = req.body;
        const updates = {};
        if (name !== undefined) updates.name = name;

        if (email !== undefined) {
            if (!isValidEmail(email)) {
                return res.status(400).json({ success: false, message: 'Only Gmail addresses (@gmail.com) are accepted.' });
            }
            if (!otp) {
                return res.status(400).json({ success: false, message: 'OTP is required to change email.' });
            }
            // Check if the new email is already taken
            const { data: existing } = await supabase
                .from('users')
                .select('id')
                .eq('email', email.toLowerCase())
                .maybeSingle();

            if (existing && existing.id !== req.user.id) {
                return res.status(400).json({ success: false, message: 'This email is already registered to another account.' });
            }

            // Verify OTP for the NEW email
            await authService.verifyOTP(email, otp);
            updates.email = email.toLowerCase();
        }

        // Handle avatar upload
        if (req.file) {
            // Get old avatar to remove
            const { data: oldUser } = await supabase
                .from('users')
                .select('avatar_url')
                .eq('id', req.user.id)
                .single();

            if (oldUser && oldUser.avatar_url) {
                const storagePath = oldUser.avatar_url.split('/storage/v1/object/public/assets/')[1];
                if (storagePath) {
                    await supabase.storage.from('assets').remove([storagePath]);
                }
            }

            const fileName = `avatars/${req.user.id}-${Date.now()}${pathModule.extname(req.file.originalname)}`;
            const { error: uploadError } = await supabase.storage
                .from('assets')
                .upload(fileName, req.file.buffer, {
                    contentType: req.file.mimetype,
                    upsert: true,
                });
            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage.from('assets').getPublicUrl(fileName);
            updates.avatar_url = urlData.publicUrl;
        }

        const { data: updated, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', req.user.id)
            .select()
            .single();

        if (error) throw error;

        res.json({ success: true, message: 'Profile updated!', user: updated });
    } catch (err) {
        logger.error('PROFILE UPDATE ERROR', { message: err.message });
        res.status(500).json({ success: false, message: 'Failed to update profile.' });
    }
});

// ───────────────────────────────────────────────────
// POST /api/auth/logout
// Clear the JWT cookie
// ───────────────────────────────────────────────────
router.post('/logout', (req, res) => {
    res.clearCookie('festiverse_token', {
        path: '/',
        secure: config.isProduction,
        sameSite: config.isProduction ? 'none' : 'lax',
    });
    res.json({ success: true, message: 'Logged out successfully.' });
});

module.exports = router;

