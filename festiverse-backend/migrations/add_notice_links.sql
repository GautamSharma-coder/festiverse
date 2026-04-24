-- Add link support to notices table
ALTER TABLE notices ADD COLUMN IF NOT EXISTS link_url TEXT DEFAULT '';
ALTER TABLE notices ADD COLUMN IF NOT EXISTS link_text TEXT DEFAULT '';
