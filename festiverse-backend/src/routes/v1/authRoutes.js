/**
 * Auth Routes (v1) — slim route definitions.
 * Validation + rate limiting at the route level.
 * All business logic handled by authController → authService.
 */
const express = require('express');
const router = express.Router();
const authController = require('../../controllers/authController');
const { registerValidation, loginValidation, sendOtpValidation, resetPasswordValidation } = require('../../validators/authValidator');
const validate = require('../../middlewares/validate');
const { rateLimit } = require('../../middlewares/rateLimit');
const { verifyToken } = require('../../middlewares/authMiddleware');
const multer = require('multer');
const pathModule = require('path');
const supabase = require('../../config/supabaseClient');
const asyncHandler = require('../../utils/asyncHandler');
const logger = require('../../config/logger');

// Rate limiters
const otpLimiter = rateLimit({ windowMs: 60000, max: 5, message: 'Too many OTP requests. Please wait 1 minute.' });
const loginLimiter = rateLimit({ windowMs: 60000, max: 5, message: 'Too many login attempts. Please wait 1 minute.' });
const registerLimiter = rateLimit({ windowMs: 60000, max: 10, message: 'Too many registration attempts. Please wait 1 minute.' });

// ─── POST /send-otp ───
router.post('/send-otp', otpLimiter, sendOtpValidation, validate, authController.sendOTP);

// ─── POST /resend-otp ───
router.post('/resend-otp', otpLimiter, sendOtpValidation, validate, authController.resendOTP);

// ─── POST /verify-otp ───
router.post('/verify-otp', otpLimiter, validate, authController.verifyOTP);

// ─── POST /register ───
router.post('/register', registerLimiter, registerValidation, validate, authController.register);

// ─── POST /login ───
router.post('/login', loginLimiter, loginValidation, validate, authController.login);

// ─── POST /forgot-password-otp ───
router.post('/forgot-password-otp', otpLimiter, sendOtpValidation, validate, authController.forgotPasswordOTP);

// ─── POST /reset-password ───
router.post('/reset-password', otpLimiter, resetPasswordValidation, validate, authController.resetPassword);

// ─── GET /profile ───
router.get('/profile', verifyToken, authController.getProfile);

// ─── PUT /profile (with avatar upload) ───
const avatarUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|webp|gif/;
        const ext = allowed.test(pathModule.extname(file.originalname).toLowerCase());
        const mime = allowed.test(file.mimetype);
        if (ext && mime) return cb(null, true);
        cb(new Error('Only image files are allowed.'));
    },
});

router.put('/profile', verifyToken, avatarUpload.single('avatar'), asyncHandler(async (req, res) => {
    const { name, email, college } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (college !== undefined) updates.college = college;

    if (req.file) {
        const { data: oldUser } = await supabase.from('users').select('avatar_url').eq('id', req.user.id).single();
        if (oldUser && oldUser.avatar_url) {
            const storagePath = oldUser.avatar_url.split('/storage/v1/object/public/assets/')[1];
            if (storagePath) await supabase.storage.from('assets').remove([storagePath]);
        }
        const fileName = `avatars/${req.user.id}-${Date.now()}${pathModule.extname(req.file.originalname)}`;
        const { error: uploadError } = await supabase.storage.from('assets').upload(fileName, req.file.buffer, { contentType: req.file.mimetype, upsert: true });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('assets').getPublicUrl(fileName);
        updates.avatar_url = urlData.publicUrl;
    }

    const { data: updated, error } = await supabase.from('users').update(updates).eq('id', req.user.id).select().single();
    if (error) throw error;
    res.json({ success: true, message: 'Profile updated!', user: updated });
}));

// ─── POST /logout ───
router.post('/logout', authController.logout);

module.exports = router;
