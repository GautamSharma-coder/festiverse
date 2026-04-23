-- ═══════════════════════════════════════════════════════════
-- Add custom_id to event_registrations table
-- Run this SQL in your Supabase SQL Editor (Dashboard → SQL)
-- ═══════════════════════════════════════════════════════════

ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS custom_id TEXT UNIQUE;

-- (Optional) If you have existing registrations without a custom_id, 
-- they will have NULL. The backend will generate them for new ones.
