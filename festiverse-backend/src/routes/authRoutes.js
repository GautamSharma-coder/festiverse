const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const supabase = require('../config/supabaseClient');
const { sendOTPEmail, sendConfirmationEmail } = require('../config/emailClient');
const { rateLimit } = require('../middlewares/rateLimit');
const logger = require('../config/logger');

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
        logger.info(`📧 OTP sent to ${email}`);
        res.json({ success: true, message: 'OTP sent to your email!' });
    } catch (err) {
        logger.error('EMAIL SEND ERROR', { email, errorMessage: err.message, code: err.code, command: err.command });
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
        const { name, college, email, phone, otp, password, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

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
        if (!password || password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
        }
        if (!otp || !/^\d{4}$/.test(otp)) {
            return res.status(400).json({ success: false, message: 'A valid 4-digit OTP is required.' });
        }

        // Validate OTP by email
        const stored = otpStore[email.toLowerCase()];
        if (!stored || stored.otp !== otp || Date.now() > stored.expiresAt) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
        }
        // Verify Razorpay Payment Signature
        if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
            return res.status(400).json({ success: false, message: 'Payment verification details are missing.' });
        }

        const crypto = require('crypto');
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'YourKeySecret')
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: 'Invalid payment signature. Payment verification failed.' });
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

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Insert new user
        const { data: newUser, error } = await supabase
            .from('users')
            .insert([{
                name, college, email, phone, role: 'student',
                has_paid: true,
                razorpay_order_id,
                razorpay_payment_id,
                password_hash
            }])
            .select()
            .single();

        if (error) throw error;

        // Generate JWT
        const token = jwt.sign(
            { id: newUser.id, phone: newUser.phone, role: 'student' },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Set JWT as httpOnly cookie
        res.cookie('festiverse_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            path: '/',
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
        });

        res.status(201).json({
            success: true,
            message: 'Registration successful!',
            user: { id: newUser.id, name: newUser.name, email: newUser.email, phone: newUser.phone },
        });

        // Send confirmation email (fire-and-forget — don't block response)
        sendConfirmationEmail(newUser.email, newUser.name).catch(err =>
            logger.error('CONFIRMATION EMAIL ERROR', { email: newUser.email, message: err.message })
        );
    } catch (err) {
        logger.error('REGISTER ERROR', { message: err.message, stack: err.stack });
        res.status(500).json({ success: false, message: 'Server error: ' + err.message });
    }
});

/**
 * POST /api/auth/login
 * Login with phone and password.
 */
router.post('/login', loginLimiter, async (req, res) => {
    try {
        const { phone, password } = req.body;
        if (!phone || !password) {
            return res.status(400).json({ success: false, message: 'Phone number and password are required.' });
        }

        const { data: user, error } = await supabase
            .from('users')
            .select('*')
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
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            path: '/',
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
        });

        res.json({
            success: true,
            message: 'Welcome back!',
            user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
        });
    } catch (err) {
        logger.error('LOGIN ERROR', { message: err.message, stack: err.stack });
        res.status(500).json({ success: false, message: 'Server error. Please try again.' });
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
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
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
        const { name, email, college } = req.body;
        const updates = {};
        if (name !== undefined) updates.name = name;
        if (email !== undefined) updates.email = email;
        if (college !== undefined) updates.college = college;

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
        logger.error('PROFILE UPDATE ERROR', { message: err.message, stack: err.stack });
        res.status(500).json({ success: false, message: 'Failed to update profile.' });
    }
});

// ───────────────────────────────────────────────────
// POST /api/auth/logout
// Clear the JWT cookie
// ───────────────────────────────────────────────────
router.post('/logout', (req, res) => {
    res.clearCookie('festiverse_token', { path: '/' });
    res.json({ success: true, message: 'Logged out successfully.' });
});

module.exports = router;

