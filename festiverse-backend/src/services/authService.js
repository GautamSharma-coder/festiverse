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
const supabase = require('../config/supabaseClient');
const { isGmailOnly } = require('../middlewares/sanitize');

// SECURITY: Standardized bcrypt rounds — 12 for passwords (OWASP recommended minimum)
const BCRYPT_ROUNDS = 12;
const MAX_OTP_ATTEMPTS = 5;

/**
 * SECURITY: Validate email is @gmail.com at the service layer (defense in depth).
 */
function assertGmail(email) {
    if (!email || !isGmailOnly(email)) {
        throw AppError.badRequest('Only Gmail addresses (@gmail.com) are accepted.');
    }
}

// ─── OTP Management ───

/**
 * Generate and send a 6-digit OTP to the given email.
 */
async function sendOTP(email) {
    assertGmail(email);
    // SECURITY: Use crypto.randomInt() for cryptographically secure OTP generation
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    // Hash OTP before storing
    const otpHash = await bcrypt.hash(otp, 10);
    const key = email.toLowerCase();

    // Store to DB: Delete any existing OTP for this email and insert new one.
    // This avoids "ON CONFLICT" errors if the UNIQUE constraint is missing.
    await supabase.from('otps').delete().eq('email', key);
    const { error: dbError } = await supabase
        .from('otps')
        .insert([{ email: key, otp: otpHash, expires_at: expiresAt }]);

    if (dbError) {
        logger.error('DB OTP STORE ERROR', { email, error: dbError });
        throw AppError.internal('Failed to process OTP. Please try again.');
    }

    try {
        await sendOTPEmail(email, otp);
        logger.info(`📧 OTP sent to ${email}`);
        return { message: 'OTP sent to your email!' };
    } catch (err) {
        await supabase.from('otps').delete().eq('email', key);
        logger.error('EMAIL SEND ERROR', { email, errorMessage: err.message });
        throw AppError.internal('Failed to send OTP email. Please try again.');
    }
}

/**
 * Send a password reset OTP.
 */
async function sendResetOTP(email) {
    assertGmail(email);
    // SECURITY: Use crypto.randomInt() for cryptographically secure OTP generation
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const otpHash = await bcrypt.hash(otp, 10);
    const key = `reset_${email.toLowerCase()}`;

    await supabase.from('otps').delete().eq('email', key);
    const { error: dbError } = await supabase
        .from('otps')
        .insert([{ email: key, otp: otpHash, expires_at: expiresAt }]);

    if (dbError) {
        logger.error('DB OTP STORE ERROR', { email, error: dbError });
        throw AppError.internal('Failed to process OTP. Please try again.');
    }

    try {
        await sendOTPEmail(email, otp);
        logger.info(`📧 Reset Password OTP sent to ${email}`);
        return { message: 'If an account exists with this email, an OTP has been sent.' };
    } catch (err) {
        await supabase.from('otps').delete().eq('email', key);
        logger.error('FORGOT PASSWORD EMAIL SEND ERROR', { email, errorMessage: err.message });
        throw AppError.internal('Failed to send OTP email. Please try again.');
    }
}

/**
 * Verify an OTP.
 * @param {string} email
 * @param {string} otp
 * @param {string} prefix - '' for registration, 'reset_' for password reset
 * @param {boolean} clearOnSuccess - Whether to delete the OTP after successful verification
 */
async function verifyOTP(email, otp, prefix = '', clearOnSuccess = true) {
    const key = `${prefix}${email.toLowerCase()}`;

    const { data: stored, error } = await supabase
        .from('otps')
        .select('otp, expires_at, attempts')
        .eq('email', key)
        .single();

    if (error || !stored || new Date() > new Date(stored.expires_at)) {
        if (stored) await supabase.from('otps').delete().eq('email', key); // Cleanup expired
        throw AppError.badRequest('Invalid or expired OTP.');
    }

    // SECURITY: Check if OTP has exceeded max attempts
    const currentAttempts = stored.attempts || 0;
    if (currentAttempts >= MAX_OTP_ATTEMPTS) {
        await supabase.from('otps').delete().eq('email', key);
        throw AppError.badRequest('Too many failed attempts. Please request a new OTP.');
    }

    const otpMatch = await bcrypt.compare(otp, stored.otp);

    if (!otpMatch) {
        // SECURITY: Increment attempt counter on failed verification
        await supabase
            .from('otps')
            .update({ attempts: currentAttempts + 1 })
            .eq('email', key);

        const remaining = MAX_OTP_ATTEMPTS - (currentAttempts + 1);
        if (remaining <= 0) {
            await supabase.from('otps').delete().eq('email', key);
            throw AppError.badRequest('Too many failed attempts. Please request a new OTP.');
        }
        throw AppError.badRequest('Invalid or expired OTP.');
    }

    // Clear used OTP only if requested
    if (clearOnSuccess) {
        await supabase.from('otps').delete().eq('email', key);
    }
    return true;
}

// ─── Registration ───

/**
 * Full registration flow: verify OTP → verify payment → create user → issue JWT.
 */
async function register(data) {
    const { name, email, phone, college, password, otp, tShirtSize,
        razorpay_payment_id, razorpay_order_id, razorpay_signature } = data;

    // SECURITY: Service-layer field validation (defense in depth)
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
        throw AppError.badRequest('A valid name is required (minimum 2 characters).');
    }
    assertGmail(email);
    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
        throw AppError.badRequest('A valid 10-digit Indian phone number is required.');
    }
    if (!password || password.length < 10 || password.length > 128) {
        throw AppError.badRequest('Password must be 10-128 characters.');
    }
    if (!college || typeof college !== 'string' || college.trim().length === 0) {
        throw AppError.badRequest('College name is required.');
    }
    if (!['S', 'M', 'L', 'XL', 'XXL', 'XXXL'].includes(tShirtSize)) {
        throw AppError.badRequest('Invalid T-Shirt size. Must be S, M, or L.');
    }

    // 1. Verify OTP
    await verifyOTP(email, otp);

    // 2. Verify Razorpay payment signature
    verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

    // SECURITY: Fetch the original college from the pending registration record.
    // Also check if the payment has already been used (status: paid).
    const { data: pending } = await supabase
        .from('pending_registrations')
        .select('user_data, status')
        .eq('order_id', razorpay_order_id)
        .single();

    if (pending && pending.status === 'paid') {
        throw AppError.badRequest('This payment has already been used for registration.');
    }

    const validatedCollege = (pending && pending.user_data && pending.user_data.college) ? pending.user_data.college : college;

    // 3. Create user (handles duplicate checks internally)
    const newUser = await userService.createUser({
        name, email, phone, college: validatedCollege, password, tShirtSize,
        razorpay_order_id, razorpay_payment_id,
    });

    // Mark the payment as "consumed" immediately to prevent reuse
    await supabase
        .from('pending_registrations')
        .update({ status: 'paid' })
        .eq('order_id', razorpay_order_id);



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
    // SECURITY: Validate email and password at the service layer
    assertGmail(email);
    if (!newPassword || newPassword.length < 10 || newPassword.length > 128) {
        throw AppError.badRequest('Password must be 10-128 characters.');
    }

    // Verify reset OTP
    await verifyOTP(email, otp, 'reset_');

    // Hash new password
    const password_hash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    // Update in database
    const { error } = await supabase
        .from('users')
        .update({ password_hash })
        .eq('email', email.toLowerCase());


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
