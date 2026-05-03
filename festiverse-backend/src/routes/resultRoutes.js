const express = require('express');
const supabase = require('../config/supabaseClient');
const { validateIdParam, isValidUUID } = require('../middlewares/sanitize');
const logger = require('../config/logger');

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

        // SECURITY: Validate event_id query param if provided
        if (req.query.event_id) {
            if (!isValidUUID(req.query.event_id)) {
                return res.status(400).json({ success: false, message: 'Invalid event ID format.' });
            }
            query = query.eq('event_id', req.query.event_id);
        }

        const { data, error } = await query;
        if (error) throw error;

        res.json({ success: true, results: data });
    } catch (err) {
        logger.error('RESULTS FETCH ERROR', { message: err.message });
        res.status(500).json({ success: false, message: 'Failed to fetch results.' });
    }
});

/**
 * GET /api/results/:eventId
 * Results for a specific event
 */
router.get('/:id', validateIdParam, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('results')
            .select('*, events(name, date)')
            .eq('event_id', req.params.id)
            .order('position', { ascending: true });

        if (error) throw error;
        res.json({ success: true, results: data });
    } catch (err) {
        logger.error('RESULTS FETCH ERROR', { message: err.message });
        res.status(500).json({ success: false, message: 'Failed to fetch results.' });
    }
});

module.exports = router;
