/**
 * Payment request validators.
 * SECURITY: Validates all userData fields at the route level before any payment processing.
 */
const { body } = require('express-validator');

/**
 * Custom validator: email must be @gmail.com (no aliases).
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

const createOrderValidation = [
    body('category').isIn(['INTERNAL', 'EXTERNAL']).withMessage('Invalid registration category.'),

    // Validate all userData fields to prevent garbage/malicious data from reaching the payment flow
    body('userData').notEmpty().withMessage('User data is required.'),
    body('userData.name').trim().notEmpty().withMessage('Name is required.')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters.')
        .matches(/^[a-zA-Z\s.'-]+$/).withMessage('Name contains invalid characters.'),
    body('userData.email').isEmail().withMessage('A valid email is required.')
        .custom(gmailOnlyValidator),
    body('userData.phone').matches(/^[6-9]\d{9}$/).withMessage('A valid 10-digit Indian phone number is required.'),
    body('userData.password').isLength({ min: 10, max: 128 }).withMessage('Password must be 10-128 characters.'),
    body('userData.college').trim().notEmpty().withMessage('College name is required.')
        .isLength({ max: 200 }).withMessage('College name is too long.')
        .matches(/^[a-zA-Z0-9\s.,'()&\-]+$/).withMessage('College name contains invalid characters.'),
    body('userData.tShirtSize').isIn(['S', 'M', 'L', 'XL', 'XXL', 'XXXL']).withMessage('Invalid T-Shirt Size.'),
];

module.exports = { createOrderValidation };
