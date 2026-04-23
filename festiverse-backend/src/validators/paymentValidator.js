/**
 * Payment request validators.
 */
const { body } = require('express-validator');

const createOrderValidation = [
    body('category').isIn(['INTERNAL', 'EXTERNAL']).withMessage('Invalid registration category.'),
];

module.exports = { createOrderValidation };
