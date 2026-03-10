const express = require('express');
const Razorpay = require('razorpay');
const logger = require('../config/logger');
const router = express.Router();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_YourKeyId',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'YourKeySecret',
});

/**
 * POST /api/payment/create-order
 * Creates a Razorpay order ID to be used on the frontend checkout
 */
router.post('/create-order', async (req, res) => {
    try {
        const fee = parseInt(process.env.REGISTRATION_FEE || '100', 10);
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
            keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_YourKeyId'
        });
    } catch (err) {
        logger.error('RAZORPAY ORDER ERROR', { message: err.message, stack: err.stack });
        res.status(500).json({ success: false, message: 'Server error while creating payment order.' });
    }
});

module.exports = router;
