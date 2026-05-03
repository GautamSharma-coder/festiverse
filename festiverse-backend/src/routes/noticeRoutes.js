const express = require('express');
const supabase = require('../config/supabaseClient');
const logger = require('../config/logger');

const router = express.Router();

/**
 * GET /api/notices
 * Public — fetch active notices for the notice board.
 */
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('notices')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json({ success: true, notices: data });
    } catch (err) {
        logger.error('NOTICES FETCH ERROR', { message: err.message });
        res.status(500).json({ success: false, message: 'Failed to fetch notices.' });
    }
});

module.exports = router;
