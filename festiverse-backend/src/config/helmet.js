/**
 * Helmet security headers configuration.
 * Extracted from server.js for clean separation.
 */
const { config } = require('./env');

const helmetOptions = {
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
            upgradeInsecureRequests: config.isProduction ? [] : null,
        },
    },
    crossOriginEmbedderPolicy: false, // Allow cross-origin resources (Supabase images)
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' }, // Allow Razorpay popup
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    hsts: config.isProduction
        ? { maxAge: 31536000, includeSubDomains: true, preload: true }
        : false,
};

module.exports = helmetOptions;
