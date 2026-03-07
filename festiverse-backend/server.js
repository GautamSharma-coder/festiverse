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

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Validate required env vars ───
const REQUIRED_ENV = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'JWT_SECRET'];
const missing = REQUIRED_ENV.filter(k => !process.env[k]);
if (missing.length > 0) {
    console.warn(`⚠️  Missing env vars: ${missing.join(', ')}`);
}
if (!process.env.RESEND_API_KEY && (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD)) {
    console.warn('⚠️  Email disabled — set RESEND_API_KEY or EMAIL_USER + EMAIL_APP_PASSWORD');
}

// ─── Middleware ───
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL, // Set in production .env
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, Postman)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(null, true); // For now, allow all but log unknown origins
            // In strict production: callback(new Error('CORS not allowed'));
        }
    },
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ─── Routes ───
const authRoutes = require('./src/routes/authRoutes');
const eventRoutes = require('./src/routes/eventRoutes');
const contactRoutes = require('./src/routes/contactRoutes');
const galleryRoutes = require('./src/routes/galleryRoutes');
const teamRoutes = require('./src/routes/teamRoutes');
const noticeRoutes = require('./src/routes/noticeRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const proxyRoutes = require('./src/routes/proxyRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/proxy', proxyRoutes);

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
    console.error('UNHANDLED ERROR:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error.' });
});

// ─── Start Server ───
app.listen(PORT, () => {
    console.log(`🚀 Festiverse Backend running on http://localhost:${PORT}`);
});

module.exports = app;