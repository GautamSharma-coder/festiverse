const express = require('express');
const supabase = require('../config/supabaseClient');
const logger = require('../config/logger');

const router = express.Router();

/**
 * GET /api/team
 * Public endpoint — fetches all team members grouped by category.
 */
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('team')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) throw error;
        res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
        res.json({ success: true, members: data });
    } catch (err) {
        logger.error('TEAM FETCH ERROR', { message: err.message });
        res.status(500).json({ success: false, message: 'Failed to fetch team members.' });
    }
});

module.exports = router;
