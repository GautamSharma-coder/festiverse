const express = require('express');
const supabase = require('../config/supabaseClient');

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
        res.json({ success: true, faculty: data });
    } catch (err) {
        console.error('FACULTY FETCH ERROR:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch faculty members.' });
    }
});

module.exports = router;
