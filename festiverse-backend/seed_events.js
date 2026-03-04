// Seed script to insert all Festiverse events into Supabase
// Fix ISP DNS hijacking
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

const events = [
    { name: 'Solo Dance', category: 'Dance' },
    { name: 'Group Dance', category: 'Dance' },
    { name: 'Battle Dance', category: 'Dance' },
    { name: 'Solo Singing', category: 'Music' },
    { name: 'Rap Battle', category: 'Music' },
    { name: 'Painting', category: 'Art' },
    { name: 'Sketching', category: 'Art' },
    { name: 'Face Painting', category: 'Art' },
    { name: 'Rangoli', category: 'Art' },
    { name: 'Mehendi', category: 'Art' },
    { name: 'Paper Craft', category: 'Art' },
    { name: 'Story Writing', category: 'Literary' },
    { name: 'Debate', category: 'Literary' },
    { name: 'Quiz', category: 'Literary' },
    { name: 'Drama', category: 'Performing Arts' },
    { name: 'Photography', category: 'Media' },
    { name: 'Reel Making', category: 'Media' },
    { name: 'Salad Decoration', category: 'Fun' },
    { name: 'Fancy Dress Competition', category: 'Fun' },
    { name: 'Fun Games', category: 'Fun' },
    { name: 'Madhubani Painting', category: 'Art' },
];

async function seed() {
    console.log('🌱 Seeding events...\n');

    for (const event of events) {
        const { data, error } = await supabase
            .from('events')
            .insert([{ name: event.name, description: event.category, location: 'GEC Samastipur' }])
            .select()
            .single();

        if (error) {
            console.log(`  ❌ ${event.name}: ${error.message}`);
        } else {
            console.log(`  ✅ ${event.name}`);
        }
    }

    console.log('\n🎉 Done! All events seeded.');
}

seed();
