require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function runFix() {
    console.log('🔧 Attempting to add unique constraint to otps.email...');
    
    const { data, error } = await supabase.rpc('exec_sql', {
        sql: "ALTER TABLE otps ADD CONSTRAINT otps_email_unique UNIQUE (email);"
    });

    if (error) {
        console.error('❌ Error executing SQL via RPC:', error);
        console.log('Possible reasons:');
        console.log('1. exec_sql function does not exist in Supabase.');
        console.log('2. Constraint already exists.');
        console.log('3. Duplicate emails already exist in otps table.');
        
        if (error.message.includes('already exists')) {
            console.log('✅ It seems the constraint already exists.');
        }
    } else {
        console.log('✅ Successfully added unique constraint!');
    }
}

runFix();
