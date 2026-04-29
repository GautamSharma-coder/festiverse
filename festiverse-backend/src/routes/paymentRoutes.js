const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const supabase = require('../config/supabaseClient');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendConfirmationEmail } = require('../config/emailClient');
const logger = require('../config/logger');
const { rateLimit } = require('../middlewares/rateLimit');
const router = express.Router();

const paymentLimiter = rateLimit({ windowMs: 60000, max: 5, message: 'Too many payment requests. Please wait a moment.' });

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * GET /api/payment/status
 * Fetches the active payment gateway from settings
 */
router.get('/status', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('settings')
            .select('value')
            .eq('key', 'active_payment_gateway')
            .single();
        
        const activeGateway = (error || !data) ? 'razorpay' : data.value;
        res.json({ success: true, activeGateway });
    } catch (err) {
        logger.error('PAYMENT STATUS ERROR', { message: err.message });
        res.json({ success: true, activeGateway: 'razorpay' }); // fallback
    }
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
        const { category, userData } = req.body;

        // Strict enum validation for category
        const validCategories = ['INTERNAL', 'EXTERNAL'];
        if (!category || !validCategories.includes(category)) {
            return res.status(400).json({ success: false, message: 'Invalid registration category.' });
        }

        let fee;
        if (category === 'INTERNAL') {
            fee = parseInt(process.env.REGISTRATION_FEE_INTERNAL || '349', 10);
        } else {
            fee = parseInt(process.env.REGISTRATION_FEE_EXTERNAL || '699', 10);
        }

        const options = {
            amount: fee * 100,
            currency: 'INR',
            receipt: `receipt_order_${Date.now()}`,
        };
        const order = await razorpay.orders.create(options);

        if (!order) {
            logger.warn('RAZORPAY: Failed to create order', { fee });
            return res.status(500).json({ success: false, message: 'Failed to create order' });
        }

        // Save user data for webhook processing (Using DB instead of files)
        if (userData) {
            const { error: pendingError } = await supabase
                .from('pending_registrations')
                .insert([{
                    order_id: order.id,
                    user_data: { ...userData, category }
                }]);

            if (pendingError) {
                logger.error('DB: Failed to store pending registration', pendingError);
            } else {
                logger.info(`📝 Stored pending registration in DB: ${order.id}`);
            }
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

/**
 * POST /api/payment/webhook
 * Handles Razorpay webhook events
 */
router.post('/webhook', async (req, res) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);

    try {
        // 1. Verify Signature (timing-safe)
        if (secret) {
            const expectedSignature = crypto
                .createHmac('sha256', secret)
                .update(body)
                .digest('hex');

            // Prevent timing attacks
            const sigBuffer = Buffer.from(signature || '', 'utf-8');
            const expectedBuffer = Buffer.from(expectedSignature, 'utf-8');
            if (sigBuffer.length !== expectedBuffer.length ||
                !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
                logger.warn('⚠️ WEBHOOK: Invalid signature');
                return res.status(400).json({ status: 'invalid signature' });
            }
        }

        const event = req.body.event;
        const payload = req.body.payload.payment.entity;
        const orderId = payload.order_id;

        logger.info(`🔔 Webhook received: ${event} | Order: ${orderId}`);

        if (event === 'payment.captured' || event === 'order.paid') {
            try {
                // 1. Fetch pending registration from DB
                const { data: pending, error: fetchError } = await supabase
                    .from('pending_registrations')
                    .select('user_data, status')
                    .eq('order_id', orderId)
                    .single();

                if (fetchError || !pending) {
                    logger.info(`ℹ️ No pending data for order ${orderId} (might be already processed)`);
                    return res.json({ status: 'ok' });
                }

                if (pending.status === 'paid') {
                    logger.info(`ℹ️ Order ${orderId} already marked as paid.`);
                    return res.json({ status: 'ok' });
                }

                const userData = pending.user_data;

                // 2. Complete Registration
                // Check if user already exists (Verify both Email and Phone)
                const { data: existingUser } = await supabase
                    .from('users')
                    .select('id')
                    .or(`email.eq.${userData.email.toLowerCase()},phone.eq.${userData.phone}`)
                    .limit(1)
                    .maybeSingle();

                if (!existingUser) {
                    const salt = await bcrypt.genSalt(10);
                    const password_hash = await bcrypt.hash(userData.password, salt);

                    // a. Create User
                    const { data: newUser, error: userError } = await supabase
                        .from('users')
                        .insert([{
                            name: userData.name,
                            email: userData.email,
                            phone: userData.phone,
                            college: userData.college,
                            password_hash,
                            role: 'student',
                            has_paid: true
                        }])
                        .select()
                        .single();

                    if (userError) throw userError;

                    // b. Update/Send ID (Implicit in sendConfirmationEmail)
                    sendConfirmationEmail(newUser.email, newUser.name, newUser.festiverse_id).catch(e => {
                        logger.error('WEBHOOK EMAIL ERROR', { message: e.message });
                    });

                    logger.info(`✅ Webhook registration complete for ${userData.email}`);
                } else {
                    // Just update paid status
                    await supabase.from('users').update({ has_paid: true }).eq('id', existingUser.id);
                    logger.info(`✅ User ${userData.email} already registered, marked as paid.`);
                }

                // 3. Mark pending registration as paid
                await supabase
                    .from('pending_registrations')
                    .update({ status: 'paid' })
                    .eq('order_id', orderId);

            } catch (err) {
                logger.error('WEBHOOK PROCESSING ERROR', { message: err.message });
                throw err;
            }
        }

        res.json({ status: 'ok' });
    } catch (err) {
        logger.error('WEBHOOK ERROR', { message: err.message });
        res.status(500).json({ status: 'error' });
    }
});

module.exports = router;
