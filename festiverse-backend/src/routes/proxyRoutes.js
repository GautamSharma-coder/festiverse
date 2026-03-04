const express = require('express');
const router = express.Router();

/**
 * GET /api/proxy/image?url=<supabase_storage_url>
 * Proxies image requests through the backend (which has DNS fix)
 * to bypass ISP DNS hijacking for Supabase Storage URLs.
 */
router.get('/image', async (req, res) => {
    const { url } = req.query;
    if (!url) {
        return res.status(400).json({ success: false, message: 'Missing url parameter.' });
    }

    // Only allow proxying Supabase storage URLs
    if (!url.includes('supabase.co/storage/')) {
        return res.status(403).json({ success: false, message: 'Only Supabase storage URLs are allowed.' });
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            return res.status(response.status).json({ success: false, message: 'Failed to fetch image.' });
        }

        // Forward content-type header
        const contentType = response.headers.get('content-type');
        if (contentType) res.setHeader('Content-Type', contentType);

        // Cache for 1 hour to reduce repeated proxy calls
        res.setHeader('Cache-Control', 'public, max-age=3600');

        // Pipe the response body
        const buffer = await response.arrayBuffer();
        res.send(Buffer.from(buffer));
    } catch (err) {
        console.error('IMAGE PROXY ERROR:', err.message);
        res.status(502).json({ success: false, message: 'Proxy fetch failed.' });
    }
});

module.exports = router;
