/**
 * Payment Routes (v1) — slim route definitions.
 */
const express = require('express');
const router = express.Router();
const paymentController = require('../../controllers/paymentController');
const { createOrderValidation } = require('../../validators/paymentValidator');
const validate = require('../../middlewares/validate');
const { rateLimit } = require('../../middlewares/rateLimit');

const paymentLimiter = rateLimit({ windowMs: 60000, max: 5, message: 'Too many payment requests. Please wait a moment.' });

// GET /status
router.get('/status', paymentController.getStatus);

// POST /create-order
router.post('/create-order', paymentLimiter, createOrderValidation, validate, paymentController.createOrder);

// POST /webhook
router.post('/webhook', paymentController.webhook);

module.exports = router;
