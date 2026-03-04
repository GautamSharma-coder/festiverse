// Run the team support migration via Supabase RPC
const undici = require('undici');
const agent = new undici.Agent({
    connect: {
        lookup: (hostname, options, callback) => {
            if (hostname.includes('supabase.co')) {
                return callback(null, [{ address: '104.18.38.10', family: 4 }]);
            }
            require('dns').lookup(hostname, options, callback);
        }
    }
});
undici.setGlobalDispatcher(agent);

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function migrate() {
    console.log('🔧 Adding team support columns...\n');

    // Add team_size column to events
    const { error: e1 } = await supabase.rpc('exec_sql', {
        sql: "ALTER TABLE events ADD COLUMN IF NOT EXISTS team_size INT DEFAULT 1;"
    }).catch(() => ({}));

    // Try direct approach via REST - add columns
    // Since we can't run raw SQL via supabase-js, we'll update events via the API
    // First let's check if team_size column already exists by trying to read it
    const { data: testData, error: testErr } = await supabase.from('events').select('team_size').limit(1);

    if (testErr && testErr.message.includes('team_size')) {
        console.log('❌ Column team_size does not exist yet.');
        console.log('   Please run add_team_support.sql in your Supabase SQL Editor first!');
        console.log('   Dashboard → SQL Editor → paste the SQL → Run');
        return;
    }

    console.log('✅ team_size column exists');

    // Update team sizes
    const teamEvents = {
        'Group Dance': 4,
        'Battle Dance': 2,
        'Drama': 5,
        'Quiz': 3,
        'Fun Games': 3,
    };

    for (const [name, size] of Object.entries(teamEvents)) {
        const { error } = await supabase.from('events').update({ team_size: size }).eq('name', name);
        if (error) {
            console.log(`  ❌ ${name}: ${error.message}`);
        } else {
            console.log(`  ✅ ${name} → team of ${size}`);
        }
    }

    console.log('\n🎉 Team sizes updated!');
}

migrate();
