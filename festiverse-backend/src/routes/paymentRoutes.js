const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const supabase = require('../config/supabaseClient');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendConfirmationEmail } = require('../config/emailClient');
const logger = require('../config/logger');
const { rateLimit } = require('../middlewares/rateLimit');
const { isGmailOnly } = require('../middlewares/sanitize');
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
        const { category, userData } = req.body;

        // Strict enum validation for category
        const validCategories = ['INTERNAL', 'EXTERNAL'];
        if (!category || !validCategories.includes(category)) {
            return res.status(400).json({ success: false, message: 'Invalid registration category.' });
        }

        // SECURITY: Validate all userData fields before processing payment
        if (!userData || typeof userData !== 'object') {
            return res.status(400).json({ success: false, message: 'User data is required.' });
        }
        if (!userData.name || typeof userData.name !== 'string' || userData.name.trim().length < 2) {
            return res.status(400).json({ success: false, message: 'A valid name is required (minimum 2 characters).' });
        }
        if (!userData.email || !isGmailOnly(userData.email)) {
            return res.status(400).json({ success: false, message: 'Only Gmail addresses (@gmail.com) are accepted.' });
        }
        if (!userData.phone || !/^[6-9]\d{9}$/.test(userData.phone)) {
            return res.status(400).json({ success: false, message: 'A valid 10-digit Indian phone number is required.' });
        }
        if (!userData.password || userData.password.length < 10 || userData.password.length > 128) {
            return res.status(400).json({ success: false, message: 'Password must be 10-128 characters.' });
        }
        if (!userData.college || typeof userData.college !== 'string' || userData.college.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'College name is required.' });
        }
        if (!['S', 'M', 'L', 'XL', 'XXL', 'XXXL'].includes(userData.tShirtSize)) {
            return res.status(400).json({ success: false, message: 'Invalid T-Shirt Size.' });
        }

        let fee;
        if (category === 'INTERNAL') {
            // SECURITY: Enforce college name for internal category
            const hostCollege = process.env.HOST_COLLEGE_NAME || 'Government Engineering College (GEC), Samastipur';
            if (!userData || userData.college !== hostCollege) {
                return res.status(400).json({ success: false, message: `The Internal category is restricted to ${hostCollege} students.` });
            }
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
            // SECURITY: Hash the password BEFORE storing it in the pending table
            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash(userData.password, salt);
            
            // Remove plain-text password from the object
            const { password, ...safeUserData } = userData;

            const { error: pendingError } = await supabase
                .from('pending_registrations')
                .insert([{
                    order_id: order.id,
                    user_data: { ...safeUserData, password_hash, category }
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
    const body = req.rawBody ? req.rawBody.toString('utf-8') : JSON.stringify(req.body);

    try {
        if (!secret) {
            logger.error('⚠️ WEBHOOK: RAZORPAY_WEBHOOK_SECRET is not configured');
            return res.status(500).json({ status: 'server error' });
        }
        if (!signature) {
             logger.warn('⚠️ WEBHOOK: Missing signature');
             return res.status(400).json({ status: 'missing signature' });
        }

        // 1. Verify Signature (timing-safe)
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(body)
            .digest('hex');

        // Prevent timing attacks
        const sigBuffer = Buffer.from(signature, 'utf-8');
        const expectedBuffer = Buffer.from(expectedSignature, 'utf-8');
        if (sigBuffer.length !== expectedBuffer.length ||
            !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
            logger.warn('⚠️ WEBHOOK: Invalid signature');
            return res.status(400).json({ status: 'invalid signature' });
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

                // SECURITY: Validate email from stored pending data
                if (!userData.email || !isGmailOnly(userData.email)) {
                    logger.warn('⚠️ WEBHOOK: Non-gmail email in pending data, skipping', { email: userData.email, orderId });
                    return res.json({ status: 'rejected' });
                }

                // 2. Complete Registration
                // Check if user already exists (Verify both Email and Phone)
                const { data: existingUser } = await supabase
                    .from('users')
                    .select('id')
                    .or(`email.eq.${userData.email.toLowerCase()},phone.eq.${userData.phone}`)
                    .limit(1)
                    .maybeSingle();

                if (!existingUser) {
                    // Use userService.createUser to ensure consistency (Festiverse ID, T-shirt size, etc.)
                    const userService = require('../services/userService');
                    const newUser = await userService.createUser({
                        name: userData.name,
                        email: userData.email,
                        phone: userData.phone,
                        college: userData.college,
                        password: userData.password_hash, // Already hashed
                        tShirtSize: userData.tShirtSize,
                        razorpay_order_id: orderId,
                        razorpay_payment_id: payload.id
                    });

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
