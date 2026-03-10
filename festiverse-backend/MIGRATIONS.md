# Database Migrations Guide

This project uses **db-migrate** for managing database schema changes and versioning.

## Setup

### Prerequisites
- PostgreSQL credentials configured in `.env` (or use Supabase)
- db-migrate installed (already in package.json)

### Configuration

Edit `database.json` with your database connection details:

```json
{
  "dev": {
    "driver": "pg",
    "user": "your_db_user",
    "password": "your_db_password",
    "host": "localhost",
    "port": 5432,
    "database": "festiverse_dev",
    "ssl": true
  }
}
```

## Available Commands

### Run all pending migrations
```bash
npm run migrate:latest
# or
db-migrate up
```

### Rollback one migration
```bash
npm run migrate:down
# or
db-migrate down
```

### Create a new migration
```bash
npm run migrate:create -- schema-update
# Creates: migrations/YYYYMMDDHHMMSS-schema-update.js
```

## Migration Files Structure

Each migration file exports two functions:

```javascript
exports.up = function(db) {
  return db.runSql(`
    -- SQL to apply
  `);
};

exports.down = function(db) {
  return db.runSql(`
    -- SQL to rollback
  `);
};
```

## Existing Migrations

- **20260310000000-add-features.js** - Adds:
  - Event details columns (rules, schedule, image_url, category)
  - User avatar support
  - QR code check-in columns
  - Results table for leaderboard
  - Sponsors management table

## Best Practices

1. **Always include `IF NOT EXISTS`** to make migrations idempotent
2. **Make migrations reversible** - always implement the `down` function
3. **Test migrations locally** before running on production
4. **Keep migrations small and focused** - one feature per migration
5. **Never modify existing migrations** - create new ones instead

## Troubleshooting

### Check migration status
```bash
db-migrate status
```

### Manual rollback (emergency only)
```bash
db-migrate down --count 5  # Rollback last 5 migrations
```

### Reset migrations (dev only)
```bash
db-migrate reset
```
