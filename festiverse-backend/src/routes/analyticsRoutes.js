const express = require('express');
const crypto = require('crypto');
const supabase = require('../config/supabaseClient');
const logger = require('../config/logger');

const router = express.Router();

// ───────────────────────────────────────────────────
// POST /api/analytics/visit
// Record a unique visit
// ───────────────────────────────────────────────────
router.post('/visit', async (req, res) => {
    try {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'] || '';
        const ipHash = crypto.createHash('sha256').update(`${ip}`).digest('hex').slice(0, 32);

        // Check if this IP has visited in the last 24 hours to avoid spamming the DB
        // (Optional optimization: only record if last visit > 24h)
        // For simplicity, we record every session start and count unique IPs in admin view

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

module.exports = router;
