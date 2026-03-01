const express = require('express');
const supabase = require('../config/supabaseClient');

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
        res.json({ success: true, images: data });
    } catch (err) {
        console.error('GALLERY FETCH ERROR:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch gallery.' });
    }
});

module.exports = router;
