/**
 * Simple in-memory rate limiter middleware.
 * Limits requests per IP per window (default: 5 requests / 60 seconds).
 */
const rateLimitStore = {};

function rateLimit({ windowMs = 60000, max = 5, message = 'Too many requests. Please try again later.' } = {}) {
    return (req, res, next) => {
        const key = `${req.ip || req.connection.remoteAddress}:${req.originalUrl || req.url}`;
        const now = Date.now();

        if (!rateLimitStore[key]) {
            rateLimitStore[key] = [];
        }

        // Remove expired timestamps
        rateLimitStore[key] = rateLimitStore[key].filter(ts => now - ts < windowMs);

        if (rateLimitStore[key].length >= max) {
            return res.status(429).json({ success: false, message });
        }

        rateLimitStore[key].push(now);
        next();
    };
}

// Cleanup old entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const key in rateLimitStore) {
        rateLimitStore[key] = rateLimitStore[key].filter(ts => now - ts < 300000);
        if (rateLimitStore[key].length === 0) delete rateLimitStore[key];
    }
}, 300000);

module.exports = { rateLimit };
