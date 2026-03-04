const express = require('express');
const supabase = require('../config/supabaseClient');

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
        res.json({ success: true, members: data });
    } catch (err) {
        console.error('TEAM FETCH ERROR:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch team members.' });
    }
});

module.exports = router;
