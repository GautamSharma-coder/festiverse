const express = require('express');
const supabase = require('../config/supabaseClient');

const router = express.Router();

/**
 * GET /api/results
 * List all results, optionally filtered by event_id query param
 */
router.get('/', async (req, res) => {
    try {
        let query = supabase
            .from('results')
            .select('*, events(name, date)')
            .order('position', { ascending: true });

        if (req.query.event_id) {
            query = query.eq('event_id', req.query.event_id);
        }

        const { data, error } = await query;
        if (error) throw error;

        res.json({ success: true, results: data });
    } catch (err) {
        console.error('RESULTS FETCH ERROR:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch results.' });
    }
});

/**
 * GET /api/results/:eventId
 * Results for a specific event
 */
router.get('/:eventId', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('results')
            .select('*, events(name, date)')
            .eq('event_id', req.params.eventId)
            .order('position', { ascending: true });

        if (error) throw error;
        res.json({ success: true, results: data });
    } catch (err) {
        console.error('RESULTS FETCH ERROR:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch results.' });
    }
});

module.exports = router;
