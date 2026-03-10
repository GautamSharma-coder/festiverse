'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbm as parameter back
  * Configuration and other dependencies might be setup here
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return db.runSql(`
    -- 1. Events: add rules, schedule, image_url, category for Event Details page
    ALTER TABLE events ADD COLUMN IF NOT EXISTS rules TEXT DEFAULT '';
    ALTER TABLE events ADD COLUMN IF NOT EXISTS schedule JSONB DEFAULT '[]';
    ALTER TABLE events ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT '';
    ALTER TABLE events ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';

    -- 2. Users: add avatar_url for User Profile Avatars
    ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT '';

    -- 3. Event Registrations: add checked_in for QR Check-in
    ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS checked_in BOOLEAN DEFAULT false;
    ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ;

    -- 4. Results table for Leaderboard
    CREATE TABLE IF NOT EXISTS results (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_id UUID REFERENCES events(id) ON DELETE CASCADE,
        position INT NOT NULL,
        participant_name TEXT NOT NULL,
        participant_college TEXT DEFAULT '',
        score TEXT DEFAULT '',
        created_at TIMESTAMPTZ DEFAULT now()
    );

    -- 5. Sponsors table
    CREATE TABLE IF NOT EXISTS sponsors (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        logo_url TEXT DEFAULT '',
        tier TEXT DEFAULT 'bronze',
        website TEXT DEFAULT '',
        is_active BOOLEAN DEFAULT true,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT now()
    );
  `);
};

exports.down = function(db) {
  return db.runSql(`
    DROP TABLE IF EXISTS sponsors;
    DROP TABLE IF EXISTS results;
    ALTER TABLE event_registrations DROP COLUMN IF EXISTS checked_in_at;
    ALTER TABLE event_registrations DROP COLUMN IF EXISTS checked_in;
    ALTER TABLE users DROP COLUMN IF EXISTS avatar_url;
    ALTER TABLE events DROP COLUMN IF EXISTS category;
    ALTER TABLE events DROP COLUMN IF EXISTS image_url;
    ALTER TABLE events DROP COLUMN IF EXISTS schedule;
    ALTER TABLE events DROP COLUMN IF EXISTS rules;
  `);
};

exports._meta = {
  "version": 1
};
