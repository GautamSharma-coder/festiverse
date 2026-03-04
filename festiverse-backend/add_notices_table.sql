-- Create the notices table for the Digital Notice Board
CREATE TABLE IF NOT EXISTS notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    color TEXT DEFAULT '#3b82f6',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Add society and category columns to team table (if not already done)
ALTER TABLE team ADD COLUMN IF NOT EXISTS society TEXT DEFAULT '';
ALTER TABLE team ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Coordinator';
