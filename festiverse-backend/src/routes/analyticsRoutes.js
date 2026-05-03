const express = require('express');
const crypto = require('crypto');
const supabase = require('../config/supabaseClient');
const { rateLimit } = require('../middlewares/rateLimit');
const logger = require('../config/logger');

const router = express.Router();

// Rate limiter for analytics endpoints (prevent inflation attacks)
const analyticsLimiter = rateLimit({ windowMs: 60000, max: 5, message: 'Too many analytics requests.' });

// ───────────────────────────────────────────────────
// POST /api/analytics/visit
// Record a unique visit (deduplicated per 24 hours)
// ───────────────────────────────────────────────────
router.post('/visit', analyticsLimiter, async (req, res) => {
    try {
        const clientId = req.body.clientId;
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'] || '';
        
        // Use client-generated UUID as the unique identifier, fallback to IP hash
        const ipHash = clientId || crypto.createHash('sha256').update(`${ip}`).digest('hex').slice(0, 32);

        // 24h deduplication: only insert if no existing visit from this ip_hash in the last 24 hours
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { data: existing } = await supabase
            .from('visitors')
            .select('id')
            .eq('ip_hash', ipHash)
            .gte('created_at', twentyFourHoursAgo)
            .limit(1);

        if (existing && existing.length > 0) {
            // Already visited in last 24h, skip insert
            return res.json({ success: true, deduplicated: true });
        }

        const { error } = await supabase
            .from('visitors')
            .insert([{
                ip_hash: ipHash,
                user_agent: userAgent
            }]);

        if (error) {
            // We don't throw here as it's just analytics, don't break the user experience
            logger.error('VISIT LOG ERROR', { message: error.message });
        }

        res.json({ success: true });
    } catch (err) {
        logger.error('ANALYTICS VISIT ERROR', { message: err.message });
        res.status(500).json({ success: false });
    }
});

// ───────────────────────────────────────────────────
// POST /api/analytics/heartbeat
// Upsert live-user presence (updates last_seen timestamp)
// ───────────────────────────────────────────────────
router.post('/heartbeat', async (req, res) => {
    try {
        const clientId = req.body.clientId;
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        
        const ipHash = clientId || crypto.createHash('sha256').update(`${ip}`).digest('hex').slice(0, 32);

        const { error } = await supabase
            .from('visitors')
            .upsert(
                {
                    ip_hash: ipHash,
                    user_agent: req.headers['user-agent'] || '',
                    last_seen: new Date().toISOString()
                },
                { onConflict: 'ip_hash' }
            );

        if (error) {
            logger.error('HEARTBEAT LOG ERROR', { message: error.message });
        }

        res.json({ success: true });
    } catch (err) {
        logger.error('ANALYTICS HEARTBEAT ERROR', { message: err.message });
        res.status(500).json({ success: false });
    }
});

module.exports = router;

