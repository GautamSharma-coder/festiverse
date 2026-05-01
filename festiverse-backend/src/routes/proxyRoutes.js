const express = require('express');
const { rateLimit } = require('../middlewares/rateLimit');
const logger = require('../config/logger');
const router = express.Router();

// Rate limit proxy requests (prevent abuse)
const proxyLimiter = rateLimit({ windowMs: 60000, max: 30, message: 'Too many proxy requests. Please slow down.' });

/**
 * Allowed Supabase host pattern — only proxy to your specific project's storage.
 * This prevents SSRF attacks where an attacker could use the proxy to
 * reach internal services or arbitrary URLs.
 */
const ALLOWED_SUPABASE_HOST_PATTERN = /^https:\/\/[a-z0-9]+\.supabase\.co\/storage\//;

/**
 * GET /api/proxy/image?url=<supabase_storage_url>
 * Proxies image requests through the backend (which has DNS fix)
 * to bypass ISP DNS hijacking for Supabase Storage URLs.
 */
router.get('/image', proxyLimiter, async (req, res) => {
    const { url } = req.query;
    if (!url) {
        return res.status(400).json({ success: false, message: 'Missing url parameter.' });
    }

    // Validate URL format
    let parsedUrl;
    try {
        parsedUrl = new URL(url);
    } catch (e) {
        return res.status(400).json({ success: false, message: 'Invalid URL format.' });
    }

    // Strict protocol check — HTTPS only
    if (parsedUrl.protocol !== 'https:') {
        return res.status(403).json({ success: false, message: 'Only HTTPS URLs are allowed.' });
    }

    // Strict host validation — only Supabase storage URLs
    if (!ALLOWED_SUPABASE_HOST_PATTERN.test(url)) {
        return res.status(403).json({ success: false, message: 'Only Supabase storage URLs are allowed.' });
    }

    // Prevent access to internal IPs (additional SSRF protection)
    const hostname = parsedUrl.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('10.') ||
        hostname.startsWith('192.168.') || hostname === '0.0.0.0' ||
        // SECURITY: Only 172.16.0.0/12 (172.16.x.x - 172.31.x.x) is private, not all 172.x.x.x
        /^172\.(1[6-9]|2[0-9]|3[01])\./.test(hostname)) {
        return res.status(403).json({ success: false, message: 'Access to internal addresses is not allowed.' });
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            return res.status(response.status).json({ success: false, message: 'Failed to fetch image.' });
        }

        // Forward content-type header
        const contentType = response.headers.get('content-type');
        if (contentType) res.setHeader('Content-Type', contentType);

        // Only allow image content types
        if (contentType && !contentType.startsWith('image/')) {
            return res.status(403).json({ success: false, message: 'Only image content is allowed through proxy.' });
        }

        // Cache for 1 hour to reduce repeated proxy calls
        res.setHeader('Cache-Control', 'public, max-age=3600');

        // Limit response size to 20MB
        const buffer = await response.arrayBuffer();
        if (buffer.byteLength > 20 * 1024 * 1024) {
            return res.status(413).json({ success: false, message: 'Image too large.' });
        }

        res.send(Buffer.from(buffer));
    } catch (err) {
        logger.error('IMAGE PROXY ERROR', { message: err.message });
        res.status(502).json({ success: false, message: 'Proxy fetch failed.' });
    }
});

module.exports = router;
