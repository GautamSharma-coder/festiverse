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

let razorpay = null;
if (config.razorpay.keyId && config.razorpay.keySecret) {
    razorpay = new Razorpay({ key_id: config.razorpay.keyId, key_secret: config.razorpay.keySecret });
}

async function createOrder(category, userData) {
    if (!razorpay) throw AppError.serviceUnavailable('Payment service is not configured.');
    if (!['INTERNAL', 'EXTERNAL'].includes(category)) throw AppError.badRequest('Invalid registration category.');

    const fee = category === 'INTERNAL' ? config.fees.internal : config.fees.external;
    const order = await razorpay.orders.create({ amount: fee * 100, currency: 'INR', receipt: `receipt_order_${Date.now()}` });
    if (!order) throw AppError.internal('Failed to create payment order.');

    if (userData) {
        const { error } = await supabase.from('pending_registrations').insert([{ order_id: order.id, user_data: { ...userData, category } }]);
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
    const existing = await userService.findExisting(ud.email, ud.phone);

    if (!existing) {
        const hash = await bcrypt.hash(ud.password, await bcrypt.genSalt(10));
        const { data: newUser, error } = await supabase.from('users').insert([{ name: ud.name, email: ud.email, phone: ud.phone, college: ud.college, password_hash: hash, role: 'student', has_paid: true }]).select().single();
        if (error) throw error;
        sendConfirmationEmail(newUser.email, newUser.name, newUser.festiverse_id).catch(e => logger.error('WEBHOOK EMAIL ERROR', { message: e.message }));
    } else {
        await supabase.from('users').update({ has_paid: true }).eq('id', existing.id);
    }

    await supabase.from('pending_registrations').update({ status: 'paid' }).eq('order_id', orderId);
    return { status: 'ok' };
}

async function getStatus() {
    try {
        const { data, error } = await supabase
            .from('settings')
            .select('value')
            .eq('key', 'active_payment_gateway')
            .single();
        
        return (error || !data) ? 'razorpay' : data.value;
    } catch (err) {
        logger.error('PAYMENT STATUS ERROR', { message: err.message });
        return 'razorpay';
    }
}

module.exports = { createOrder, verifyWebhookSignature, processWebhook, getStatus };
