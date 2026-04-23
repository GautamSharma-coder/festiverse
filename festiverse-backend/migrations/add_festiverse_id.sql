-- ═══════════════════════════════════════════════════════════
-- Add festiverse_id to users table
-- Run this SQL in your Supabase SQL Editor (Dashboard → SQL)
-- ═══════════════════════════════════════════════════════════

-- 1. Add the festiverse_id column (unique, nullable for existing users)
ALTER TABLE users ADD COLUMN IF NOT EXISTS festiverse_id TEXT UNIQUE;

-- 2. Backfill existing users who don't have a festiverse_id yet
-- Format: F26 + first letter of first name + first letter of last word + random 4-digit number
-- If the user has only one name, second letter defaults to 'X'
UPDATE users
SET festiverse_id = 
  'F26' || 
  UPPER(LEFT(SPLIT_PART(name, ' ', 1), 1)) || 
  UPPER(LEFT(
    CASE 
      WHEN ARRAY_LENGTH(STRING_TO_ARRAY(TRIM(name), ' '), 1) > 1 
        THEN SPLIT_PART(TRIM(name), ' ', ARRAY_LENGTH(STRING_TO_ARRAY(TRIM(name), ' '), 1))
      ELSE 'X'
    END, 1
  )) || 
  LPAD((FLOOR(RANDOM() * 9000 + 1000))::TEXT, 4, '0')
WHERE festiverse_id IS NULL;
