/**
 * Auth Controller — thin request/response handlers.
 * All business logic lives in authService.
 */
const authService = require('../services/authService');
const userService = require('../services/userService');
const asyncHandler = require('../utils/asyncHandler');

const AppError = require('../utils/AppError');

exports.sendOTP = asyncHandler(async (req, res) => {
    // SECURITY: Check for duplicate email before sending OTP
    const existing = await userService.findByEmail(req.body.email);
    if (existing) {
        throw AppError.conflict('Email address already registered. Please login instead.');
    }

    const result = await authService.sendOTP(req.body.email);
    res.json({ success: true, message: result.message });
});

exports.verifyOTP = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    // SECURITY: Check for duplicate email before verifying OTP
    const existing = await userService.findByEmail(email);
    if (existing) {
        throw AppError.conflict('Email address already registered. Please login instead.');
    }

    await authService.verifyOTP(email, otp, '', false);
    res.json({ success: true, message: 'OTP verified successfully.' });
});

exports.register = asyncHandler(async (req, res) => {
    const { user, token } = await authService.register(req.body);
    authService.setCookieToken(res, token);
    res.status(201).json({ success: true, message: 'Registration successful!', user });
});

exports.login = asyncHandler(async (req, res) => {
    const { phone, password } = req.body;
    const { user, token } = await authService.login(phone, password);
    authService.setCookieToken(res, token);
    res.json({ success: true, message: 'Welcome back!', user });
});

exports.forgotPasswordOTP = asyncHandler(async (req, res) => {
    const user = await userService.findByEmail(req.body.email);
    if (!user) {
        // Security: do not reveal whether the email is registered
        return res.json({ success: true, message: 'If an account exists with this email, an OTP has been sent.' });
    }
    const result = await authService.sendResetOTP(req.body.email);
    res.json({ success: true, message: result.message });
});

exports.resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;
    const result = await authService.resetPassword(email, otp, newPassword);
    res.json({ success: true, message: result.message });
});

exports.getProfile = asyncHandler(async (req, res) => {
    const user = await userService.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, user });
});

exports.logout = (req, res) => {
    authService.clearCookieToken(res);
    res.json({ success: true, message: 'Logged out successfully.' });
};
