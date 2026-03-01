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

// ─── Middleware ───
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ─── Routes ───
const authRoutes = require('./src/routes/authRoutes');
const eventRoutes = require('./src/routes/eventRoutes');
const contactRoutes = require('./src/routes/contactRoutes');
const galleryRoutes = require('./src/routes/galleryRoutes');
const teamRoutes = require('./src/routes/teamRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/admin', adminRoutes);

// ─── Health Check ───
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        message: '🚀 Festiverse Backend is running!',
        endpoints: {
            auth: '/api/auth (send-otp, register, login)',
            events: '/api/events',
            contact: '/api/contact',
            gallery: '/api/gallery',
            team: '/api/team',
            admin: '/api/admin (login, registrations, messages, users, gallery, team, events)',
        },
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