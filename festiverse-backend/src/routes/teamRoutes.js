const express = require('express');
const supabase = require('../config/supabaseClient');

const router = express.Router();

/**
 * GET /api/team
 * Fetches all team members.
 */
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('team')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) throw error;
        res.json({ success: true, team: data });
    } catch (err) {
        console.error('TEAM FETCH ERROR:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch team.' });
    }
});

module.exports = router;
