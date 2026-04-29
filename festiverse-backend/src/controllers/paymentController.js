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

exports.getStatus = asyncHandler(async (req, res) => {
    const activeGateway = await paymentService.getStatus();
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.json({ success: true, activeGateway });
});

exports.webhook = asyncHandler(async (req, res) => {
    const signature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);

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
