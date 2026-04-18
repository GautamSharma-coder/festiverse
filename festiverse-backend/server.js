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
const logger = require('./src/config/logger');

const app = express();
const PORT = process.env.PORT || 3000;

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
    process.env.FRONTEND_URL, // Set in production .env
].filter(Boolean);

// Security headers
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow cross-origin image loading
}));

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, Postman)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            logger.warn('CORS blocked request from unknown origin', { origin });
            callback(new Error('CORS not allowed'));
        }
    },
    credentials: true,
}));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

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

// ─── Error Handler ───
app.use((err, req, res, next) => {
    logger.error('Unhandled Error', { message: err.message, stack: err.stack });
    res.status(500).json({ success: false, message: 'Internal Server Error.' });
});

// ─── Start Server ───
app.listen(PORT, () => {
    logger.info(`🚀 Festiverse Backend running on http://localhost:${PORT}`);
});

module.exports = app;