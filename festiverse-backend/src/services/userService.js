/**
 * User Service
 * Handles all user-related business logic:
 * - Festiverse ID generation
 * - User lookups (by email, phone, ID)
 * - User creation (used by both auth register AND payment webhook)
 */
const supabase = require('../config/supabaseClient');
const bcrypt = require('bcrypt');
const AppError = require('../utils/AppError');
const logger = require('../config/logger');

/**
 * Generate a unique Festiverse ID.
 * Format: F26 + first letter of first name + first letter of last name + 4-digit random
 * Example: "Gautam Sharma" → F26GS4821
 */
function generateFestiverseId(fullName) {
    const parts = fullName.trim().split(/\s+/);
    const firstInitial = (parts[0]?.[0] || 'X').toUpperCase();
    const lastInitial = (parts.length > 1 ? parts[parts.length - 1][0] : 'X').toUpperCase();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
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
 * Check if a user already exists by email OR phone.
 * Returns the existing user or null.
 */
async function findExisting(email, phone) {
    const { data, error } = await supabase
        .from('users')
        .select('id, email, phone')
        .or(`email.eq.${email.toLowerCase()},phone.eq.${phone}`)
        .limit(1)
        .maybeSingle();

    if (error) throw error;
    return data || null;
}

/**
 * Create a new user with a unique Festiverse ID.
 * Retries up to 5 times if Festiverse ID conflicts.
 * Used by BOTH auth registration and payment webhook.
 */
async function createUser({ name, email, phone, college, password, tShirtSize, payment_method, transaction_id, razorpay_order_id, razorpay_payment_id }) {
    // Check for existing user
    const existing = await findExisting(email, phone);
    if (existing) {
        const isEmailMatch = existing.email.toLowerCase() === email.toLowerCase();
        throw AppError.conflict(
            isEmailMatch ? 'Email address already registered.' : 'Phone number already registered.'
        );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

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
                has_paid: payment_method === 'upi' ? false : true,
                payment_method,
                transaction_id,
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
