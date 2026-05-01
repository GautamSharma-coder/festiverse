/**
 * Express App Factory
 * Creates and configures the Express application with all middleware.
 * Separated from server.js for clean testability.
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');

// Config
const corsOptions = require('./config/cors');
const helmetOptions = require('./config/helmet');
const { config } = require('./config/env');
const logger = require('./config/logger');

// Middleware
const requestLogger = require('./middlewares/requestLogger');
const requestId = require('./middlewares/requestId');
const { sanitizeInputs } = require('./middlewares/sanitize');
const { rateLimit } = require('./middlewares/rateLimit');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');

// Routes
const registerRoutes = require('./routes');

function createApp() {
    const app = express();

    // ─── Trust Proxy ───
    app.set('trust proxy', 1);
    app.disable('x-powered-by');

    // ─── Logging ───
    app.use(requestLogger);

    // ─── Security ───
    app.use(helmet(helmetOptions));
    app.use(cors(corsOptions));

    // ─── Body Parsing ───
    app.use(cookieParser());
    // Store raw body for webhook verification
    const rawBodyBuffer = (req, res, buf, encoding) => {
        if (buf && buf.length) {
            req.rawBody = buf;
        }
    };
    app.use(express.json({ limit: '10mb', verify: rawBodyBuffer }));
    app.use(express.urlencoded({ limit: '10mb', extended: true, verify: rawBodyBuffer }));

    // ─── CSRF Protection ───
    app.use((req, res, next) => {
        if (config.isProduction && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
            // Exclude webhook route from CSRF check since it comes from Razorpay
            if (req.path === '/api/v1/payment/webhook' || req.path === '/api/payment/webhook') {
                return next();
            }
            
            const origin = req.headers.origin;
            const referer = req.headers.referer;
            
            // Allow if origin matches our allowed origins, or if it's a same-origin referer
            const isValidOrigin = origin && config.allowedOrigins.includes(origin);
            const isValidReferer = referer && config.allowedOrigins.some(allowed => referer.startsWith(allowed));

            if (!isValidOrigin && !isValidReferer) {
                logger.warn('CSRF validation failed', { origin, referer, path: req.path });
                return res.status(403).json({ success: false, message: 'Invalid request origin.' });
            }
        }
        next();
    });

    // ─── Global Rate Limiter ───
    app.use(rateLimit({ windowMs: 60000, max: 100, message: 'Too many requests from this IP. Please slow down.' }));

    // ─── Input Sanitization ───
    app.use(sanitizeInputs);

    // ─── Request ID ───
    app.use(requestId);

    // ─── Live User Tracking ───
    const liveUsers = new Map();
    const STALE_THRESHOLD = 45000;

    setInterval(() => {
        const now = Date.now();
        for (const [hash, lastSeen] of liveUsers.entries()) {
            if (now - lastSeen > STALE_THRESHOLD) liveUsers.delete(hash);
        }
    }, 60000);

    app.set('liveUsersMap', liveUsers);

    // Heartbeat endpoint (before route registrar since it's a special case)
    app.post('/api/v1/analytics/heartbeat', (req, res) => {
        const clientId = req.body.clientId;
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'] || '';
        
        // Use client-generated UUID for 100% accurate tracking, fallback to IP+UA hash
        const hash = clientId || crypto.createHash('sha256').update(`${ip}-${userAgent}`).digest('hex').slice(0, 16);
        
        liveUsers.set(hash, Date.now());
        res.json({ success: true, liveCount: liveUsers.size });
    });
    // Backward compat heartbeat
    app.post('/api/analytics/heartbeat', (req, res) => {
        const clientId = req.body.clientId;
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'] || '';
        
        const hash = clientId || crypto.createHash('sha256').update(`${ip}-${userAgent}`).digest('hex').slice(0, 16);
        
        liveUsers.set(hash, Date.now());
        res.json({ success: true, liveCount: liveUsers.size });
    });

    // ─── API Routes ───
    registerRoutes(app);

    // ─── Health Check ───
    app.get('/', (req, res) => {
        res.json({
            status: 'ok',
            message: '🚀 Festiverse Backend v1 is running!',
            version: '1.0.0',
            api: '/api/v1',
        });
    });

    // ─── Error Handling (must be last) ───
    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
}

module.exports = createApp;
