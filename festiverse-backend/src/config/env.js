/**
 * Centralized environment configuration.
 * Single source of truth for all environment variables.
 * Validates critical variables at import time and exports typed config.
 */
require('dotenv').config();

const config = {
    // ─── Server ───
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',

    // ─── JWT ───
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    },

    // ─── Supabase ───
    supabase: {
        url: process.env.SUPABASE_URL,
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    },

    // ─── Razorpay ───
    razorpay: {
        keyId: process.env.RAZORPAY_KEY_ID,
        keySecret: process.env.RAZORPAY_KEY_SECRET,
        webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
    },

    // ─── Registration Fees ───
    fees: {
        internal: parseInt(process.env.REGISTRATION_FEE_INTERNAL || '349', 10),
        external: parseInt(process.env.REGISTRATION_FEE_EXTERNAL || '699', 10),
    },

    // ─── Admin ───
    admin: {
        password: process.env.ADMIN_PASSWORD,
    },

    // ─── Frontend ───
    frontend: {
        url: process.env.FRONTEND_URL,
    },

    // ─── Email (Gmail) ───
    gmail: {
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
        user: process.env.EMAIL_USER,
    },

    // ─── Email (Resend) ───
    resend: {
        apiKey: process.env.RESEND_API_KEY,
    },
    
    // ─── Festiverse Meta ───
    hostCollege: process.env.HOST_COLLEGE_NAME || 'Government Engineering College (GEC), Samastipur',

    // ─── CORS Allowed Origins ───
    allowedOrigins: [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://festiverse-lac.vercel.app',
        'https://www.udaangecsamastipur.in',
        'https://udaangecsamastipur.in',
        process.env.FRONTEND_URL,
    ].filter(Boolean),
};

// ─── Startup Validation ───
function validateEnv() {
    const critical = ['JWT_SECRET', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'ADMIN_PASSWORD', 'HOST_COLLEGE_NAME'];
    const missing = critical.filter(k => !process.env[k]);
    if (missing.length > 0) {
        console.error(`❌ Missing CRITICAL env vars: ${missing.join(', ')}. Server cannot start safely.`);
        process.exit(1);
    }

    const recommended = ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', 'FRONTEND_URL'];
    const missingRec = recommended.filter(k => !process.env[k]);
    if (missingRec.length > 0) {
        console.warn(`⚠️  Missing recommended env vars: ${missingRec.join(', ')}`);
    }

    const gmailVars = ['GMAIL_CLIENT_ID', 'GMAIL_CLIENT_SECRET', 'GMAIL_REFRESH_TOKEN', 'EMAIL_USER'];
    const missingGmail = gmailVars.filter(k => !process.env[k]);
    if (missingGmail.length > 0) {
        console.warn(`⚠️  Gmail API not fully configured — missing: ${missingGmail.join(', ')}`);
    }
}

module.exports = { config, validateEnv };
