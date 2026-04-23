-- ═══════════════════════════════════════════════════════════
-- Add Razorpay payment columns to users table
-- Run this SQL in your Supabase SQL Editor (Dashboard → SQL)
-- ═══════════════════════════════════════════════════════════
ALTER TABLE users ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS has_paid BOOLEAN DEFAULT false;
