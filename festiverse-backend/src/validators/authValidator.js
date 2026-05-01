/**
 * Auth request validators using express-validator.
 * SECURITY: All email fields enforce @gmail.com domain only.
 */
const { body } = require('express-validator');

/**
 * Custom validator: email must be @gmail.com (no aliases, no other domains).
 */
const gmailOnlyValidator = (value) => {
    const email = value.trim().toLowerCase();
    if (!email.endsWith('@gmail.com')) {
        throw new Error('Only Gmail addresses (@gmail.com) are accepted.');
    }
    if (email.split('@')[0].includes('+')) {
        throw new Error('Gmail aliases with "+" are not allowed.');
    }
    return true;
};

const registerValidation = [
    body('name').trim().notEmpty().withMessage('Name is required.')
        .isLength({ min: 2 }).withMessage('Name must be at least 2 characters.')
        .isLength({ max: 100 }).withMessage('Name is too long (max 100 chars).')
        .matches(/^[a-zA-Z\s.'-]+$/).withMessage('Name contains invalid characters.'),
    body('email').isEmail().withMessage('A valid email is required.')
        .normalizeEmail().isLength({ max: 254 })
        .custom(gmailOnlyValidator),
    body('phone').matches(/^[6-9]\d{9}$/).withMessage('A valid 10-digit Indian phone number is required (must start with 6-9).'),
    body('password').isLength({ min: 10 }).withMessage('Password must be at least 10 characters.')
        .isLength({ max: 128 }).withMessage('Password is too long.'),
    body('college').trim().notEmpty().withMessage('College name is required.')
        .isLength({ max: 200 }).withMessage('College name is too long (max 200 chars).')
        .matches(/^[a-zA-Z0-9\s.,'()&\-]+$/).withMessage('College name contains invalid characters.'),
    body('tShirtSize').isIn(['S', 'M', 'L', 'XL', 'XXL', 'XXXL']).withMessage('Invalid T-Shirt Size.'),
    body('otp').matches(/^\d{6}$/).withMessage('A valid 6-digit OTP is required.'),
    body('razorpay_payment_id').notEmpty().withMessage('Payment ID is required.'),
    body('razorpay_order_id').notEmpty().withMessage('Order ID is required.'),
    body('razorpay_signature').notEmpty().withMessage('Payment signature is required.'),
];

const loginValidation = [
    body('phone').notEmpty().withMessage('Phone number is required.')
        .matches(/^[6-9]\d{9}$/).withMessage('A valid 10-digit Indian phone number is required.'),
    body('password').notEmpty().withMessage('Password is required.')
        .isLength({ max: 128 }).withMessage('Password is too long.'),
];

const sendOtpValidation = [
    body('email').isEmail().withMessage('A valid email address is required.')
        .normalizeEmail()
        .custom(gmailOnlyValidator),
];

const verifyOtpValidation = [
    body('email').isEmail().withMessage('A valid email address is required.')
        .normalizeEmail()
        .custom(gmailOnlyValidator),
    body('otp').matches(/^\d{6}$/).withMessage('A valid 6-digit OTP is required.'),
];

const resetPasswordValidation = [
    body('email').isEmail().withMessage('Invalid email format.')
        .normalizeEmail()
        .custom(gmailOnlyValidator),
    body('otp').notEmpty().withMessage('OTP is required.'),
    body('newPassword').isLength({ min: 10 }).withMessage('Password must be at least 10 characters.')
        .isLength({ max: 128 }).withMessage('Password is too long.'),
];

module.exports = { registerValidation, loginValidation, sendOtpValidation, verifyOtpValidation, resetPasswordValidation };
