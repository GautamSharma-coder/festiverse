// Fix ISP DNS hijacking — force IP resolution for native fetch
const undici = require('undici');
const agent = new undici.Agent({
    connect: {
        lookup: (hostname, options, callback) => {
            if (hostname.includes('supabase.co')) {
                // Force resolve to Cloudflare IP instead of hijacked ISP IP (49.44.79.236)
                return callback(null, [{ address: '104.18.38.10', family: 4 }]);
            }
            require('dns').lookup(hostname, options, callback);
        }
    }
});
undici.setGlobalDispatcher(agent);

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const logger = require('./src/config/logger');
const { sanitizeInputs } = require('./src/middlewares/sanitize');
const { rateLimit } = require('./src/middlewares/rateLimit');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Live User Tracking ───
const liveUsers = new Map(); // Store userHash -> lastSeen
const CLEANUP_INTERVAL = 60000; // 1 minute
const STALE_THRESHOLD = 45000; // 45 seconds

setInterval(() => {
    const now = Date.now();
    for (const [hash, lastSeen] of liveUsers.entries()) {
        if (now - lastSeen > STALE_THRESHOLD) {
            liveUsers.delete(hash);
        }
    }
}, CLEANUP_INTERVAL);


// ─── Request/Response Logging Middleware ───
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
            method: req.method,
            path: req.originalUrl || req.path,
            status: res.statusCode,
            duration: `${duration}ms`,
        };
        if (res.statusCode >= 400) {
            logger.warn('HTTP Request', logData);
        } else {
            logger.info('HTTP Request', logData);
        }
    });
    next();
});

// ─── Validate required env vars ───
const CRITICAL_ENV = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'JWT_SECRET', 'ADMIN_PASSWORD'];
const missingCritical = CRITICAL_ENV.filter(k => !process.env[k]);
if (missingCritical.length > 0) {
    console.error(`❌ Missing CRITICAL env vars: ${missingCritical.join(', ')}. Server cannot start safely.`);
    process.exit(1);
}
const RECOMMENDED_ENV = ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', 'FRONTEND_URL'];
const missingRecommended = RECOMMENDED_ENV.filter(k => !process.env[k]);
if (missingRecommended.length > 0) {
    console.warn(`⚠️  Missing recommended env vars: ${missingRecommended.join(', ')}`);
}
const gmailVars = ['GMAIL_CLIENT_ID', 'GMAIL_CLIENT_SECRET', 'GMAIL_REFRESH_TOKEN', 'EMAIL_USER'];
const missingGmail = gmailVars.filter(k => !process.env[k]);
if (missingGmail.length > 0) {
    console.warn(`⚠️  Gmail API not fully configured — missing: ${missingGmail.join(', ')}`);
}

// ─── Middleware ───
app.set('trust proxy', 1); // Trust first proxy (Render, Railway, etc.) for correct req.ip

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://[IP_ADDRESS]',
    'https://festiverse-lac.vercel.app',
    'https://www.udaangecsamastipur.in',
    process.env.FRONTEND_URL, // Set in production .env
].filter(Boolean);

// ─── Security Headers (Hardened Helmet) ───
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://checkout.razorpay.com", "https://code.iconify.design", "https://api.iconify.design"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "blob:", "https://*.supabase.co", "https://grainy-gradients.vercel.app"],
            connectSrc: ["'self'", "https://checkout.razorpay.com", "https://api.razorpay.com", "https://*.supabase.co", "https://api.iconify.design"],
            frameSrc: ["'self'", "https://api.razorpay.com", "https://checkout.razorpay.com"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
        },
    },
    crossOriginEmbedderPolicy: false, // Allow cross-origin resources (Supabase images)
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' }, // Allow Razorpay popup
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    hsts: process.env.NODE_ENV === 'production'
        ? { maxAge: 31536000, includeSubDomains: true, preload: true }
        : false,
}));

// ─── Remove X-Powered-By (defense in depth) ───
app.disable('x-powered-by');

// ─── CORS ───
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            logger.warn('CORS blocked request from unknown origin', { origin });
            callback(new Error('CORS not allowed'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    maxAge: 86400, // Cache preflight for 24 hours
}));

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ─── Global Rate Limiter (100 requests/min per IP) ───
app.use(rateLimit({
    windowMs: 60000,
    max: 100,
    message: 'Too many requests from this IP. Please slow down.'
}));

// ─── Input Sanitization (XSS Prevention) ───
app.use(sanitizeInputs);

// ─── Request ID (for debugging without leaking internals) ───
app.use((req, res, next) => {
    req.requestId = crypto.randomUUID();
    res.setHeader('X-Request-ID', req.requestId);
    next();
});

// ─── Routes ───
const authRoutes = require('./src/routes/authRoutes');
const eventRoutes = require('./src/routes/eventRoutes');
const contactRoutes = require('./src/routes/contactRoutes');
const galleryRoutes = require('./src/routes/galleryRoutes');
const teamRoutes = require('./src/routes/teamRoutes');
const facultyRoutes = require('./src/routes/facultyRoutes');
const noticeRoutes = require('./src/routes/noticeRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const proxyRoutes = require('./src/routes/proxyRoutes');
const resultRoutes = require('./src/routes/resultRoutes');
const sponsorRoutes = require('./src/routes/sponsorRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const hiringRoutes = require('./src/routes/hiringRoutes');
const certificateRoutes = require('./src/routes/certificateRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/proxy', proxyRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/sponsors', sponsorRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/hiring', hiringRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/analytics', analyticsRoutes);

// ─── Analytics & Heartbeat ───
app.post('/api/analytics/heartbeat', (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';
    const hash = crypto.createHash('sha256').update(`${ip}-${userAgent}`).digest('hex').slice(0, 16);

    liveUsers.set(hash, Date.now());
    res.json({ success: true, liveCount: liveUsers.size });
});

// Internal helper for admin routes to get live count
app.set('liveUsersMap', liveUsers);


// ─── Health Check ───
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        message: '🚀 Festiverse Backend is running!',
        version: '1.0.0',
    });
});

// ─── 404 Handler ───
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found.' });
});

// ─── Error Handler (never leak internals) ───
app.use((err, req, res, next) => {
    logger.error('Unhandled Error', {
        requestId: req.requestId,
        message: err.message,
        stack: err.stack,
        path: req.originalUrl,
        method: req.method,
    });
    // Never send stack traces or detailed errors to the client
    const statusCode = err.status || err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: statusCode === 500 ? 'Internal Server Error.' : err.message || 'An error occurred.',
        requestId: req.requestId, // Allow user to reference for support
    });
});

// ─── Start Server ───
app.listen(PORT, () => {
    logger.info(`🚀 Festiverse Backend running on http://localhost:${PORT}`);
});

module.exports = app;