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
    CREATE TABLE IF NOT EXISTS pending_registrations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id TEXT UNIQUE NOT NULL,
        user_data JSONB NOT NULL,
        status TEXT DEFAULT 'pending', -- pending, paid, failed
        created_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_pending_order_id ON pending_registrations(order_id);
  `);
};

exports.down = function(db) {
  return db.runSql(`
    DROP TABLE IF EXISTS pending_registrations;
  `);
};

exports._meta = {
  "version": 1
};
