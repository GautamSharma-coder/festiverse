/**
 * Auth request validators using express-validator.
 */
const { body } = require('express-validator');

const registerValidation = [
    body('name').trim().notEmpty().withMessage('Name is required.')
        .isLength({ max: 100 }).withMessage('Name is too long (max 100 chars).')
        .matches(/^[a-zA-Z\s.'-]+$/).withMessage('Name contains invalid characters.'),
    body('email').isEmail().withMessage('A valid email is required.')
        .normalizeEmail().isLength({ max: 254 }),
    body('phone').matches(/^\d{10}$/).withMessage('A valid 10-digit phone number is required.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.')
        .isLength({ max: 128 }).withMessage('Password is too long.'),
    body('otp').matches(/^\d{6}$/).withMessage('A valid 6-digit OTP is required.'),
    body('razorpay_payment_id').notEmpty().withMessage('Payment ID is required.'),
    body('razorpay_order_id').notEmpty().withMessage('Order ID is required.'),
    body('razorpay_signature').notEmpty().withMessage('Payment signature is required.'),
];

const loginValidation = [
    body('phone').notEmpty().withMessage('Phone number is required.'),
    body('password').notEmpty().withMessage('Password is required.'),
];

const sendOtpValidation = [
    body('email').isEmail().withMessage('A valid email address is required.').normalizeEmail(),
];

const resetPasswordValidation = [
    body('email').isEmail().withMessage('Invalid email format.').normalizeEmail(),
    body('otp').notEmpty().withMessage('OTP is required.'),
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.')
        .isLength({ max: 128 }).withMessage('Password is too long.'),
];

module.exports = { registerValidation, loginValidation, sendOtpValidation, resetPasswordValidation };
