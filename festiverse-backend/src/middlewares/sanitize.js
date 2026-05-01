/**
 * Input Sanitization Middleware
 * Strips HTML/script tags, trims whitespace, and normalizes inputs
 * to prevent Stored XSS and injection attacks.
 */

/**
 * Strip HTML tags from a string (prevents Stored XSS).
 * Preserves the inner text content.
 */
function stripHtml(str) {
    if (typeof str !== 'string') return str;
    return str
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove <script> blocks
        .replace(/<[^>]*>/g, '')  // Remove all remaining HTML tags
        .replace(/&lt;/gi, '<').replace(/&gt;/gi, '>') // Decode common entities then re-strip
        .replace(/<[^>]*>/g, '') // Second pass after entity decoding
        .trim();
}

/**
 * Escape characters that could be used in injection.
 */
function escapeSpecialChars(str) {
    if (typeof str !== 'string') return str;
    return str
        .replace(/\$/g, '&#36;')   // Prevent template injection
        .replace(/`/g, '&#96;');   // Prevent backtick execution
}

/**
 * Deep-sanitize all string values in an object (req.body).
 * Recursively walks nested objects and arrays.
 */
function sanitizeObject(obj) {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'string') {
        return escapeSpecialChars(stripHtml(obj));
    }
    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }
    if (typeof obj === 'object') {
        const cleaned = {};
        for (const [key, value] of Object.entries(obj)) {
            // Don't sanitize password fields — they need to be stored exactly as-is
            if (key === 'password' || key === 'newPassword' || key === 'otp') {
                cleaned[key] = value;
            } else {
                cleaned[key] = sanitizeObject(value);
            }
        }
        return cleaned;
    }
    return obj; // numbers, booleans, etc.
}

/**
 * Express middleware — sanitizes req.body, req.query, and req.params.
 * Apply globally or on specific routes.
 */
function sanitizeInputs(req, res, next) {
    if (req.body && typeof req.body === 'object') {
        req.body = sanitizeObject(req.body);
    }
    if (req.query && typeof req.query === 'object') {
        req.query = sanitizeObject(req.query);
    }
    if (req.params && typeof req.params === 'object') {
        req.params = sanitizeObject(req.params);
    }
    next();
}

/**
 * Validate that a string is a valid UUID v4 format.
 * Use this to validate :id params before querying the DB.
 */
function isValidUUID(str) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

/**
 * Middleware to validate :id param is a valid UUID.
 * Returns 400 if invalid — prevents injection through route params.
 */
function validateIdParam(req, res, next) {
    const id = req.params.id;
    if (id && !isValidUUID(id)) {
        return res.status(400).json({ success: false, message: 'Invalid ID format.' });
    }
    next();
}

/**
 * Validate email format — STRICT: only @gmail.com is accepted.
 * Rejects + aliases (e.g. user+tag@gmail.com) to prevent duplicate account tricks.
 */
function isValidEmail(email) {
    if (typeof email !== 'string') return false;
    const trimmed = email.trim().toLowerCase();
    // Must be a well-formed email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return false;
    // Must be @gmail.com domain only
    if (!trimmed.endsWith('@gmail.com')) return false;
    // Reject + aliases (user+tag@gmail.com)
    const localPart = trimmed.split('@')[0];
    if (localPart.includes('+')) return false;
    // Max length per RFC 5321
    if (trimmed.length > 254) return false;
    return true;
}

/**
 * Explicitly check if an email is a @gmail.com address.
 * Use for defense-in-depth checks in services.
 */
function isGmailOnly(email) {
    if (typeof email !== 'string') return false;
    const trimmed = email.trim().toLowerCase();
    return trimmed.endsWith('@gmail.com') && !trimmed.split('@')[0].includes('+');
}

/**
 * Validate phone number (10 digits).
 */
function isValidPhone(phone) {
    return /^\d{10}$/.test(phone);
}

/**
 * Enforce max length on a string field.
 */
function enforceMaxLength(str, maxLen) {
    if (typeof str !== 'string') return str;
    return str.slice(0, maxLen);
}

module.exports = {
    sanitizeInputs,
    sanitizeObject,
    stripHtml,
    isValidUUID,
    validateIdParam,
    isValidEmail,
    isGmailOnly,
    isValidPhone,
    enforceMaxLength,
};
