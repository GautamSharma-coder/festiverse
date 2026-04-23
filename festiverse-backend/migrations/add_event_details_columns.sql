-- ═══════════════════════════════════════════════════════════
-- Add Rich Details columns to events table
-- Run this SQL in your Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════
ALTER TABLE events ADD COLUMN IF NOT EXISTS rules TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS schedule TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS prizes TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS image_url TEXT;
