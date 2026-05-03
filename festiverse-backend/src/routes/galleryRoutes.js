const express = require('express');
const supabase = require('../config/supabaseClient');
const logger = require('../config/logger');

const router = express.Router();

/**
 * GET /api/gallery
 * Fetches all gallery images.
 */
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('gallery')
            .select('*')
            .order('uploaded_at', { ascending: false });

        if (error) throw error;
        res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
        res.json({ success: true, images: data });
    } catch (err) {
        logger.error('GALLERY FETCH ERROR', { message: err.message });
        res.status(500).json({ success: false, message: 'Failed to fetch gallery.' });
    }
});

module.exports = router;
