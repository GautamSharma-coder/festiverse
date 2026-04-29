-- ═══════════════════════════════════════════════════════════
-- Add columns to users table for manual UPI payments
-- Run this SQL in your Supabase SQL Editor (Dashboard → SQL)
-- ═══════════════════════════════════════════════════════════

-- Add columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'razorpay';
ALTER TABLE users ADD COLUMN IF NOT EXISTS transaction_id TEXT;

-- Create settings table for global configuration
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- Initialize default payment gateway
INSERT INTO settings (key, value) 
VALUES ('active_payment_gateway', 'razorpay') 
ON CONFLICT (key) DO NOTHING;

-- If needed, update existing users to have razorpay as payment method
UPDATE users SET payment_method = 'razorpay' WHERE payment_method IS NULL;
