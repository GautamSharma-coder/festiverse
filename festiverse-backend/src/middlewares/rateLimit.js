/**
 * Rate limiter middleware using Upstash Redis for Vercel serverless.
 * Falls back to in-memory store if Redis is not configured.
 */
const { Ratelimit } = require('@upstash/ratelimit');
const { Redis } = require('@upstash/redis');
const logger = require('../config/logger');

// Fallback in-memory store
const rateLimitStore = {};

// Optional Upstash initialization
let redisRatelimit = null;

try {
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        const redis = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL,
            token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });

        // Use fixed window algorithm
        redisRatelimit = new Ratelimit({
            redis: redis,
            limiter: Ratelimit.fixedWindow(100, '60 s'),
        });
        logger.info('🚀 Upstash Redis Rate Limiter initialized');
    } else {
        logger.warn('⚠️ Upstash Redis not configured. Falling back to in-memory rate limiting.');
    }
} catch (error) {
    logger.error('Failed to initialize Upstash Redis', { message: error.message });
}

function rateLimit({ windowMs = 60000, max = 5, message = 'Too many requests. Please try again later.' } = {}) {
    return async (req, res, next) => {
        const key = `${req.ip || req.connection.remoteAddress}:${req.originalUrl || req.url}`;

        // 1. Try Upstash Redis
        if (redisRatelimit) {
            try {
                // Determine limits based on the route max
                // Since Ratelimit instance is created with fixed 100/60s, we dynamically create one per config if needed,
                // but creating instances on the fly is lightweight.
                const dynamicLimiter = new Ratelimit({
                    redis: Redis.fromEnv(),
                    limiter: Ratelimit.fixedWindow(max, `${windowMs / 1000} s`),
                });

                const { success } = await dynamicLimiter.limit(key);
                if (!success) {
                    return res.status(429).json({ success: false, message });
                }
                return next();
            } catch (err) {
                logger.error('Redis Rate Limiter Error', { message: err.message });
                // Fallthrough to in-memory if Redis fails
            }
        }

        // 2. Fallback to In-Memory
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

// Cleanup old entries for in-memory store every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const key in rateLimitStore) {
        rateLimitStore[key] = rateLimitStore[key].filter(ts => now - ts < 300000);
        if (rateLimitStore[key].length === 0) delete rateLimitStore[key];
    }
}, 300000);

module.exports = { rateLimit };
