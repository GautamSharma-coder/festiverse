const express = require('express');
const supabase = require('../config/supabaseClient');

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
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json({ success: true, notices: data });
    } catch (err) {
        console.error('NOTICES FETCH ERROR:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch notices.' });
    }
});

module.exports = router;
