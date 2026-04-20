const express = require('express');
const Razorpay = require('razorpay');
const logger = require('../config/logger');
const { rateLimit } = require('../middlewares/rateLimit');
const router = express.Router();

const paymentLimiter = rateLimit({ windowMs: 60000, max: 5, message: 'Too many payment requests. Please wait a moment.' });

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * POST /api/payment/create-order
 * Creates a Razorpay order ID to be used on the frontend checkout
 */
router.post('/create-order', paymentLimiter, async (req, res) => {
    try {
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            return res.status(503).json({ success: false, message: 'Payment service is not configured.' });
        }
        const { category } = req.body;
        let fee;

        if (category === 'INTERNAL') {
            fee = parseInt(process.env.REGISTRATION_FEE_INTERNAL || '349', 10);
        } else {
            fee = parseInt(process.env.REGISTRATION_FEE_EXTERNAL || '699', 10);
        }

        const options = {
            amount: fee * 100, // amount in the smallest currency unit (paise)
            currency: 'INR',
            receipt: `receipt_order_${Date.now()}`,
        };
        const order = await razorpay.orders.create(options);

        if (!order) {
            logger.warn('RAZORPAY: Failed to create order', { fee });
            return res.status(500).json({ success: false, message: 'Failed to create order' });
        }

        res.json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID
        });
    } catch (err) {
        logger.error('RAZORPAY ORDER ERROR', { message: err.message, stack: err.stack });
        res.status(500).json({ success: false, message: 'Server error while creating payment order.' });
    }
});

module.exports = router;
