-- Add participant_email and user_id columns to results table
ALTER TABLE results ADD COLUMN IF NOT EXISTS participant_email TEXT DEFAULT '';
ALTER TABLE results ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;
