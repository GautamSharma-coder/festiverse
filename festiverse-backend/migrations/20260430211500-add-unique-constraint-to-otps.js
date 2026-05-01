'use strict';

exports.up = function(db) {
  return db.runSql(`
    ALTER TABLE otps ADD CONSTRAINT otps_email_unique UNIQUE (email);
  `);
};

exports.down = function(db) {
  return db.runSql(`
    ALTER TABLE otps DROP CONSTRAINT IF EXISTS otps_email_unique;
  `);
};
