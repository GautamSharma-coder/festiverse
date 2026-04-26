const express = require('express');
const supabase = require('../config/supabaseClient');

const router = express.Router();

/**
 * GET /api/sponsors
 * List active sponsors ordered by sort_order
 */
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('sponsors')
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true });

        if (error) throw error;
        res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
        res.json({ success: true, sponsors: data });
    } catch (err) {
        console.error('SPONSORS FETCH ERROR:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch sponsors.' });
    }
});

module.exports = router;
