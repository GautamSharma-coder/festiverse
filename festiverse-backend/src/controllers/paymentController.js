/**
 * Payment Controller — thin request/response handlers.
 * All business logic lives in paymentService.
 */
const paymentService = require('../services/paymentService');
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../config/logger');

exports.createOrder = asyncHandler(async (req, res) => {
    const { category, userData } = req.body;
    const result = await paymentService.createOrder(category, userData);
    res.json({ success: true, ...result });
});

exports.webhook = asyncHandler(async (req, res) => {
    const signature = req.headers['x-razorpay-signature'];
    // SECURITY: Use raw request body for signature verification.
    // JSON.stringify(req.body) can reorder keys and break HMAC validation.
    const body = req.rawBody ? req.rawBody.toString('utf-8') : JSON.stringify(req.body);

    try {
        paymentService.verifyWebhookSignature(body, signature);
    } catch (err) {
        logger.warn('⚠️ WEBHOOK: Invalid signature');
        return res.status(400).json({ status: 'invalid signature' });
    }

    const event = req.body.event;
    const payload = req.body.payload.payment.entity;
    const result = await paymentService.processWebhook(event, payload);
    res.json(result);
});
