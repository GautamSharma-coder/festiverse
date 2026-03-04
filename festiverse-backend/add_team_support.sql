-- Add team support columns
-- Run this in Supabase SQL Editor

-- 1. Add team_size to events (1 = solo, 2+ = team event with that many members)
ALTER TABLE events ADD COLUMN IF NOT EXISTS team_size INT DEFAULT 1;

-- 2. Add team_members JSONB to event_registrations (stores array of member names for team events)
ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS team_members JSONB DEFAULT '[]';

-- 3. Update team sizes for team events
UPDATE events SET team_size = 4 WHERE name = 'Group Dance';
UPDATE events SET team_size = 2 WHERE name = 'Battle Dance';
UPDATE events SET team_size = 5 WHERE name = 'Drama';
UPDATE events SET team_size = 3 WHERE name = 'Quiz';
UPDATE events SET team_size = 3 WHERE name = 'Fun Games';
