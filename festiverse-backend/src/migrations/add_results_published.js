/**
 * Migration: Add results_published column to events table.
 * 
 * Run this once via: node src/migrations/add_results_published.js
 * 
 * Alternatively, run this SQL in the Supabase SQL Editor:
 *   ALTER TABLE events ADD COLUMN IF NOT EXISTS results_published BOOLEAN DEFAULT false;
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function migrate() {
    console.log('🔄 Running migration: add results_published to events...');

    const { error } = await supabase.rpc('exec_sql', {
        query: 'ALTER TABLE events ADD COLUMN IF NOT EXISTS results_published BOOLEAN DEFAULT false;'
    });

    if (error) {
        // If RPC doesn't exist, try a direct approach — update a row with the new field
        // Supabase PostgREST won't add columns, so we need the SQL Editor
        console.warn('⚠️  RPC exec_sql not available. Please run this SQL manually in Supabase SQL Editor:');
        console.log('');
        console.log('  ALTER TABLE events ADD COLUMN IF NOT EXISTS results_published BOOLEAN DEFAULT false;');
        console.log('');
        console.log('After running the SQL, this migration is complete.');
        process.exit(0);
    }

    console.log('✅ Migration complete: results_published column added to events table.');
    process.exit(0);
}

migrate();
