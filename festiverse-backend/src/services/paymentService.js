/**
 * Payment Service — Razorpay order creation, webhook processing, signature verification.
 */
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { config } = require('../config/env');
const supabase = require('../config/supabaseClient');
const { sendConfirmationEmail } = require('../config/emailClient');
const userService = require('./userService');
const AppError = require('../utils/AppError');
const logger = require('../config/logger');
const bcrypt = require('bcrypt');
const { isGmailOnly } = require('../middlewares/sanitize');

let razorpay = null;
if (config.razorpay.keyId && config.razorpay.keySecret) {
    razorpay = new Razorpay({ key_id: config.razorpay.keyId, key_secret: config.razorpay.keySecret });
}

async function createOrder(category, userData) {
    if (!razorpay) throw AppError.serviceUnavailable('Payment service is not configured.');
    if (!['INTERNAL', 'EXTERNAL'].includes(category)) throw AppError.badRequest('Invalid registration category.');

    // SECURITY: If category is INTERNAL, enforce the correct college name
    if (category === 'INTERNAL') {
        const internalCollege = config.hostCollege;
        if (!userData || userData.college !== internalCollege) {
            logger.warn('⚠️ Payment spoofing attempt: INTERNAL category with external college', { userData });
            throw AppError.badRequest(`The Internal category is restricted to ${internalCollege} students.`);
        }
    }


    const fee = category === 'INTERNAL' ? config.fees.internal : config.fees.external;

    if (userData) {
        // SECURITY: Validate email is gmail.com before processing
        if (!userData.email || !isGmailOnly(userData.email)) {
            throw AppError.badRequest('Only Gmail addresses (@gmail.com) are accepted.');
        }
        // SECURITY: Validate all required fields
        if (!userData.name || typeof userData.name !== 'string' || userData.name.trim().length < 2) {
            throw AppError.badRequest('A valid name is required.');
        }
        if (!userData.phone || !/^[6-9]\d{9}$/.test(userData.phone)) {
            throw AppError.badRequest('A valid 10-digit Indian phone number is required.');
        }
        if (!userData.password || userData.password.length < 10) {
            throw AppError.badRequest('Password must be at least 10 characters.');
        }

        // SECURITY: Check if user already exists BEFORE creating payment order
        const existing = await userService.findExisting(userData.email, userData.phone);
        if (existing) {
            if (existing.email.toLowerCase() === userData.email.toLowerCase()) {
                throw AppError.conflict('This email address is already registered. Please login instead.');
            }
            if (existing.phone === userData.phone) {
                throw AppError.conflict('This phone number is already registered. Please login instead.');
            }
        }
    }

    const order = await razorpay.orders.create({ amount: fee * 100, currency: 'INR', receipt: `receipt_order_${Date.now()}` });
    if (!order) throw AppError.internal('Failed to create payment order.');

    // Save user data for webhook processing
    if (userData) {
        // SECURITY: Hash the password BEFORE storing it in the pending table
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(userData.password, salt);
        
        // Remove plain-text password from the object
        const { password, ...safeUserData } = userData;

        const { error } = await supabase.from('pending_registrations').insert([{ 
            order_id: order.id, 
            user_data: { ...safeUserData, password_hash, category } 
        }]);
        if (error) logger.error('DB: Failed to store pending registration', error);
        else logger.info(`📝 Stored pending registration in DB: ${order.id}`);
    }

    return { orderId: order.id, amount: order.amount, currency: order.currency, keyId: config.razorpay.keyId };
}

function verifyWebhookSignature(body, signature) {
    const secret = config.razorpay.webhookSecret;
    if (!secret) return true;
    const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
    const sigBuf = Buffer.from(signature || '', 'utf-8');
    const expBuf = Buffer.from(expected, 'utf-8');
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
        throw AppError.badRequest('Invalid webhook signature.');
    }
    return true;
}

async function processWebhook(event, payload) {
    const orderId = payload.order_id;
    logger.info(`🔔 Webhook: ${event} | Order: ${orderId}`);
    if (event !== 'payment.captured' && event !== 'order.paid') return { status: 'ok' };

    const { data: pending } = await supabase.from('pending_registrations').select('user_data, status').eq('order_id', orderId).single();
    if (!pending || pending.status === 'paid') return { status: 'ok' };

    const ud = pending.user_data;

    // SECURITY: Validate email from stored data before creating user
    if (!ud.email || !isGmailOnly(ud.email)) {
        logger.warn('⚠️ Webhook: Non-gmail email in pending data, skipping', { email: ud.email, orderId });
        return { status: 'rejected' };
    }

    const existing = await userService.findExisting(ud.email, ud.phone);

    if (!existing) {
        // Use userService.createUser to ensure consistency (Festiverse ID, T-shirt size, etc.)
        const newUser = await userService.createUser({
            name: ud.name,
            email: ud.email,
            phone: ud.phone,
            college: ud.college,
            password: ud.password_hash, // Already hashed
            tShirtSize: ud.tShirtSize,
            razorpay_order_id: orderId,
            razorpay_payment_id: payload.id
        });

        // 3. Send confirmation email (fire-and-forget)
        sendConfirmationEmail(newUser.email, newUser.name, newUser.festiverse_id).catch(err =>
            logger.error('WEBHOOK CONFIRMATION EMAIL ERROR', { email: newUser.email, message: err.message })
        );
    } else {
        await supabase.from('users').update({ has_paid: true }).eq('id', existing.id);
    }

    await supabase.from('pending_registrations').update({ status: 'paid' }).eq('order_id', orderId);
    return { status: 'ok' };
}

module.exports = { createOrder, verifyWebhookSignature, processWebhook };
