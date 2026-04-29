/**
 * Auth Service
 * Handles authentication business logic:
 * - OTP generation, storage, and verification
 * - Password hashing and comparison
 * - JWT token generation and cookie management
 */
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { config } = require('../config/env');
const { sendOTPEmail, sendConfirmationEmail } = require('../config/emailClient');
const userService = require('./userService');
const AppError = require('../utils/AppError');
const logger = require('../config/logger');

// In-memory OTP store keyed by email (use Redis in production for multi-instance)
const otpStore = {};

// ─── OTP Management ───

/**
 * Generate and send a 6-digit OTP to the given email.
 */
async function sendOTP(email) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email.toLowerCase()] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };

    try {
        await sendOTPEmail(email, otp);
        logger.info(`📧 OTP sent to ${email}`);
        return { message: 'OTP sent to your email!' };
    } catch (err) {
        delete otpStore[email.toLowerCase()];
        logger.error('EMAIL SEND ERROR', { email, errorMessage: err.message });
        throw AppError.internal('Failed to send OTP email. Please try again.');
    }
}

/**
 * Send a password reset OTP.
 */
async function sendResetOTP(email) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[`reset_${email.toLowerCase()}`] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };

    try {
        await sendOTPEmail(email, otp);
        logger.info(`📧 Reset Password OTP sent to ${email}`);
        return { message: 'If an account exists with this email, an OTP has been sent.' };
    } catch (err) {
        delete otpStore[`reset_${email.toLowerCase()}`];
        logger.error('FORGOT PASSWORD EMAIL SEND ERROR', { email, errorMessage: err.message });
        throw AppError.internal('Failed to send OTP email. Please try again.');
    }
}

/**
 * Verify an OTP using timing-safe comparison.
 * @param {string} email
 * @param {string} otp
 * @param {string} prefix - '' for registration, 'reset_' for password reset
 */
function verifyOTP(email, otp, prefix = '', keep = false) {
    const key = `${prefix}${email.toLowerCase()}`;
    const stored = otpStore[key];

    if (!stored || Date.now() > stored.expiresAt) {
        throw AppError.badRequest('Invalid or expired OTP.');
    }

    const otpMatch = crypto.timingSafeEqual(
        Buffer.from(stored.otp, 'utf-8'),
        Buffer.from(otp, 'utf-8')
    );

    if (!otpMatch) {
        throw AppError.badRequest('Invalid or expired OTP.');
    }

    // Clear used OTP unless keeping it for a multi-step process
    if (!keep) {
        delete otpStore[key];
    }
    return true;
}

// ─── Registration ───

/**
 * Full registration flow: verify OTP → verify payment → create user → issue JWT.
 */
async function register(data) {
    const { name, email, phone, college, password, otp, tShirtSize,
        payment_method, transaction_id,
        razorpay_payment_id, razorpay_order_id, razorpay_signature } = data;

    // 1. Verify OTP
    verifyOTP(email, otp);

    // 2. Verify Payment
    if (payment_method === 'upi') {
        if (!transaction_id) throw AppError.badRequest('Transaction ID is required for UPI payments.');
    } else {
        verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    }

    // 3. Create user (handles duplicate checks internally)
    const newUser = await userService.createUser({
        name, email, phone, college, password, tShirtSize,
        payment_method, transaction_id,
        razorpay_order_id, razorpay_payment_id,
    });

    // 4. Generate JWT
    const token = generateToken(newUser);

    // 5. Send confirmation email (fire-and-forget)
    sendConfirmationEmail(newUser.email, newUser.name, newUser.festiverse_id).catch(err =>
        logger.error('CONFIRMATION EMAIL ERROR', { email: newUser.email, message: err.message })
    );

    return {
        user: userService.sanitizeUser(newUser),
        token,
    };
}

// ─── Login ───

/**
 * Login with phone + password.
 */
async function login(phone, password) {
    const user = await userService.findByPhone(phone);
    if (!user) {
        throw AppError.unauthorized('Invalid phone number or password.');
    }

    if (!user.password_hash) {
        throw AppError.unauthorized('Account registered before passwords were required. Please contact admin.');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
        throw AppError.unauthorized('Invalid phone number or password.');
    }

    const token = generateToken(user);
    return {
        user: userService.sanitizeUser(user),
        token,
    };
}

// ─── Password Reset ───

/**
 * Reset password using OTP.
 */
async function resetPassword(email, otp, newPassword) {
    // Verify reset OTP
    verifyOTP(email, otp, 'reset_');

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(newPassword, salt);

    // Update in database
    await userService.updateUser(null, { password_hash });
    // We need to find by email first
    const supabase = require('../config/supabaseClient');
    const { error } = await supabase
        .from('users')
        .update({ password_hash })
        .eq('email', email);

    if (error) throw error;

    logger.info(`🔑 Password reset successfully for ${email}`);
    return { message: 'Password has been reset successfully. You can now log in.' };
}

// ─── JWT Helpers ───

/**
 * Generate a JWT for the given user.
 */
function generateToken(user) {
    return jwt.sign(
        { id: user.id, phone: user.phone, role: user.role || 'student' },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
    );
}

/**
 * Set JWT as a httpOnly cookie on the response.
 */
function setCookieToken(res, token) {
    res.cookie('festiverse_token', token, {
        httpOnly: true,
        secure: config.isProduction,
        sameSite: config.isProduction ? 'none' : 'lax',
        path: '/',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });
}

/**
 * Clear the JWT cookie.
 */
function clearCookieToken(res) {
    res.clearCookie('festiverse_token', {
        path: '/',
        secure: config.isProduction,
        sameSite: config.isProduction ? 'none' : 'lax',
    });
}

// ─── Payment Signature Verification ───

/**
 * Verify Razorpay payment signature (timing-safe).
 */
function verifyPaymentSignature(orderId, paymentId, signature) {
    if (!orderId || !paymentId || !signature) {
        throw AppError.badRequest('Payment verification details are missing.');
    }

    const razorpaySecret = config.razorpay.keySecret;
    if (!razorpaySecret) {
        throw AppError.serviceUnavailable('Payment verification is not configured.');
    }

    const expectedSignature = crypto
        .createHmac('sha256', razorpaySecret)
        .update(orderId + '|' + paymentId)
        .digest('hex');

    const sigMatch = expectedSignature.length === signature.length &&
        crypto.timingSafeEqual(
            Buffer.from(expectedSignature, 'utf-8'),
            Buffer.from(signature, 'utf-8')
        );

    if (!sigMatch) {
        throw AppError.badRequest('Invalid payment signature. Payment verification failed.');
    }

    return true;
}

module.exports = {
    sendOTP,
    sendResetOTP,
    verifyOTP,
    register,
    login,
    resetPassword,
    generateToken,
    setCookieToken,
    clearCookieToken,
    verifyPaymentSignature,
};
