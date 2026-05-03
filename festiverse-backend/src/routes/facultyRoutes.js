const express = require('express');
const supabase = require('../config/supabaseClient');
const logger = require('../config/logger');

const router = express.Router();

/**
 * GET /api/faculty
 * Public endpoint — fetches all faculty members.
 */
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('faculty')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) throw error;
        res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
        res.json({ success: true, faculty: data });
    } catch (err) {
        logger.error('FACULTY FETCH ERROR', { message: err.message });
        res.status(500).json({ success: false, message: 'Failed to fetch faculty members.' });
    }
});

module.exports = router;
