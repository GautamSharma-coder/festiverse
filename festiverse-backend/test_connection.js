// Quick Supabase connectivity test
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

console.log('Testing Supabase connection...');
console.log('URL:', process.env.SUPABASE_URL);
console.log('Key starts with:', process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20) + '...');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

(async () => {
    try {
        console.log('\n1. Testing basic fetch...');
        const { data, error } = await supabase.from('users').select('count').limit(1);
        if (error) {
            console.error('❌ Supabase error:', error.message, error.code, error.hint);
        } else {
            console.log('✅ Connected successfully! Data:', data);
        }
    } catch (err) {
        console.error('❌ Network error:', err.message);
        console.error('   Cause:', err.cause?.message || 'unknown');
    }
})();
