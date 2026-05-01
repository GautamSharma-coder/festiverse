/**
 * Migration: Add 'attempts' column to the 'otps' table.
 * 
 * SECURITY: Tracks the number of failed OTP verification attempts.
 * After MAX_OTP_ATTEMPTS (5) failures, the OTP is invalidated to
 * prevent brute-force attacks on 6-digit OTPs.
 * 
 * Run this SQL on your Supabase database:
 * 
 * ALTER TABLE otps ADD COLUMN IF NOT EXISTS attempts INTEGER DEFAULT 0;
 * 
 * Or run this script: node src/migrations/add_otp_attempts.js
 */

const supabase = require('../config/supabaseClient');
const logger = require('../config/logger');

async function migrate() {
    console.log('🔄 Running migration: add_otp_attempts');

    // Use Supabase's RPC or raw SQL to add the column
    const { error } = await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE otps ADD COLUMN IF NOT EXISTS attempts INTEGER DEFAULT 0;'
    });

    if (error) {
        // If the RPC method doesn't exist, print the manual SQL
        console.error('⚠️ Could not run migration automatically:', error.message);
        console.log('');
        console.log('📋 Please run this SQL manually in Supabase SQL Editor:');
        console.log('');
        console.log('  ALTER TABLE otps ADD COLUMN IF NOT EXISTS attempts INTEGER DEFAULT 0;');
        console.log('');
        process.exit(1);
    }

    console.log('✅ Migration complete: otps.attempts column added');
    process.exit(0);
}

migrate();
