/**
 * User Service
 * Handles all user-related business logic:
 * - Festiverse ID generation
 * - User lookups (by email, phone, ID)
 * - User creation (used by both auth register AND payment webhook)
 */
const supabase = require('../config/supabaseClient');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const AppError = require('../utils/AppError');
const logger = require('../config/logger');
const { isGmailOnly } = require('../middlewares/sanitize');

/**
 * Generate a unique Festiverse ID.
 * Format: F26 + first letter of first name + first letter of last name + 4-digit random
 * Example: "Gautam Sharma" → F26GS4821
 * SECURITY: Uses crypto.randomInt() for unpredictable ID generation.
 */
function generateFestiverseId(fullName) {
    const parts = fullName.trim().split(/\s+/);
    const firstInitial = (parts[0]?.[0] || 'X').toUpperCase();
    const lastInitial = (parts.length > 1 ? parts[parts.length - 1][0] : 'X').toUpperCase();
    const randomNum = crypto.randomInt(1000, 9999);
    return `F26${firstInitial}${lastInitial}${randomNum}`;
}

/**
 * Find a user by email (case-insensitive).
 */
async function findByEmail(email) {
    const { data, error } = await supabase
        .from('users')
        .select('id, name, email, phone, college, role, has_paid, avatar_url, festiverse_id, password_hash, created_at')
        .eq('email', email.toLowerCase())
        .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return data || null;
}

/**
 * Find a user by phone number.
 */
async function findByPhone(phone) {
    const { data, error } = await supabase
        .from('users')
        .select('id, name, email, phone, college, role, has_paid, avatar_url, festiverse_id, password_hash, created_at')
        .eq('phone', phone)
        .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
}

/**
 * Find a user by ID.
 */
async function findById(id) {
    const { data, error } = await supabase
        .from('users')
        .select('id, name, email, phone, college, role, has_paid, avatar_url, festiverse_id, created_at')
        .eq('id', id)
        .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
}

/**
 * Check if a user already exists by email OR phone OR razorpay_order_id.
 * Returns the existing user or null.
 * SECURITY: Uses separate queries instead of string interpolation to prevent
 * PostgREST filter injection.
 */
async function findExisting(email, phone, razorpayOrderId = null) {
    // Check email
    const { data: byEmail, error: e1 } = await supabase
        .from('users')
        .select('id, email, phone, razorpay_order_id')
        .eq('email', email.toLowerCase())
        .limit(1)
        .maybeSingle();
    if (e1) throw e1;
    if (byEmail) return byEmail;

    // Check phone
    const { data: byPhone, error: e2 } = await supabase
        .from('users')
        .select('id, email, phone, razorpay_order_id')
        .eq('phone', phone)
        .limit(1)
        .maybeSingle();
    if (e2) throw e2;
    if (byPhone) return byPhone;

    // Check razorpay_order_id if provided
    if (razorpayOrderId) {
        const { data: byOrder, error: e3 } = await supabase
            .from('users')
            .select('id, email, phone, razorpay_order_id')
            .eq('razorpay_order_id', razorpayOrderId)
            .limit(1)
            .maybeSingle();
        if (e3) throw e3;
        if (byOrder) return byOrder;
    }

    return null;
}


/**
 * Create a new user with a unique Festiverse ID.
 * Retries up to 5 times if Festiverse ID conflicts.
 * Used by BOTH auth registration and payment webhook.
 */
async function createUser({ name, email, phone, college, password, tShirtSize, razorpay_order_id, razorpay_payment_id }) {
    // SECURITY: Final defense-in-depth validation before DB insert
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
        throw AppError.badRequest('A valid name is required.');
    }
    if (!email || !isGmailOnly(email)) {
        throw AppError.badRequest('Only Gmail addresses (@gmail.com) are accepted.');
    }
    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
        throw AppError.badRequest('A valid 10-digit Indian phone number is required.');
    }
    if (!college || typeof college !== 'string' || college.trim().length === 0) {
        throw AppError.badRequest('College name is required.');
    }
    if (!password || typeof password !== 'string') {
        throw AppError.badRequest('Password is required.');
    }

    // Check for existing user (including the payment ID)
    const existing = await findExisting(email, phone, razorpay_order_id);
    if (existing) {
        if (existing.email.toLowerCase() === email.toLowerCase()) {
            throw AppError.conflict('Email address already registered.');
        }
        if (existing.phone === phone) {
            throw AppError.conflict('Phone number already registered.');
        }
        if (existing.razorpay_order_id === razorpay_order_id) {
            throw AppError.conflict('This payment has already been used for registration.');
        }
    }


    // Hash password (if not already hashed)
    let password_hash = password;
    const isAlreadyHashed = /^\$2[aby]\$\d{2}\$/.test(password);
    if (!isAlreadyHashed) {
        // SECURITY: Use 12 rounds (OWASP recommended minimum for passwords)
        const salt = await bcrypt.genSalt(12);
        password_hash = await bcrypt.hash(password, salt);
    }

    // Generate unique Festiverse ID with retry logic
    let festiverse_id;
    let newUser;
    let insertError;

    for (let attempt = 0; attempt < 5; attempt++) {
        festiverse_id = generateFestiverseId(name);
        const { data, error } = await supabase
            .from('users')
            .insert([{
                name, college, email, phone, role: 'student',
                has_paid: true,
                razorpay_order_id,
                razorpay_payment_id,
                password_hash,
                festiverse_id,
                t_shirt_size: tShirtSize,
            }])
            .select()
            .single();

        if (!error) {
            newUser = data;
            insertError = null;
            break;
        }

        // Retry on festiverse_id unique constraint violation
        if (error.code === '23505' && error.message?.includes('festiverse_id')) {
            insertError = error;
            continue;
        }
        throw error; // Other errors — throw immediately
    }

    if (insertError) {
        throw AppError.internal('Could not generate a unique Festiverse ID. Please try again.');
    }

    logger.info(`✅ New user created: ${newUser.festiverse_id} (${email})`);
    return newUser;
}

/**
 * Update a user's profile fields.
 */
async function updateUser(userId, updates) {
    const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Strip sensitive fields from a user object for API responses.
 */
function sanitizeUser(user) {
    if (!user) return null;
    const { password_hash, ...safeUser } = user;
    return safeUser;
}

module.exports = {
    generateFestiverseId,
    findByEmail,
    findByPhone,
    findById,
    findExisting,
    createUser,
    updateUser,
    sanitizeUser,
};
