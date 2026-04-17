const express = require('express');
const QRCode = require('qrcode');
const supabase = require('../config/supabaseClient');
const { verifyToken } = require('../middlewares/authMiddleware');
const { sendEventRegistrationEmail } = require('../config/emailClient');

const router = express.Router();

/**
 * GET /api/events
 * Fetches all available events.
 */
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .order('date', { ascending: true });

        if (error) throw error;
        res.json({ success: true, events: data });
    } catch (err) {
        console.error('EVENTS FETCH ERROR:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch events.' });
    }
});

/**
 * GET /api/events/lookup-member/:festiverseId
 * Look up a registered user by their Festiverse ID (e.g. F26GS4821).
 * Used during team event registration to auto-fill member details.
 */
router.get('/lookup-member/:festiverseId', verifyToken, async (req, res) => {
    try {
        const fid = req.params.festiverseId.toUpperCase().trim();
        if (!fid || !/^F26[A-Z]{2}\d{4}$/.test(fid)) {
            return res.status(400).json({ success: false, message: 'Invalid Festiverse ID format. Expected: F26XX1234' });
        }

        const { data: member, error } = await supabase
            .from('users')
            .select('id, name, phone, email, college, festiverse_id')
            .eq('festiverse_id', fid)
            .single();

        if (error || !member) {
            return res.status(404).json({ success: false, message: 'No user found with this Festiverse ID.' });
        }

        // Don't allow adding yourself as a team member
        if (member.id === req.user.id) {
            return res.status(400).json({ success: false, message: 'You cannot add yourself as a team member.' });
        }

        res.json({
            success: true,
            member: {
                name: member.name,
                phone: member.phone,
                email: member.email,
                college: member.college,
                festiverse_id: member.festiverse_id,
            },
        });
    } catch (err) {
        console.error('MEMBER LOOKUP ERROR:', err);
        res.status(500).json({ success: false, message: 'Failed to look up member.' });
    }
});

/**
 * POST /api/events/register
 * Registers a user for selected events. Supports team events with member names.
 * Body: { registrations: [{ eventId, teamMembers?: [{name, phone}] }] }
 * OR legacy: { eventIds: [id1, id2] }
 */
router.post('/register', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        let regs = [];

        if (req.body.registrations) {
            // New format: registrations with optional team members
            regs = req.body.registrations.map((r) => ({
                user_id: userId,
                event_id: r.eventId,
                team_members: r.teamMembers || [],
            }));

            // Resolve any team members specified by festiverse_id
            for (const reg of regs) {
                const resolved = [];
                for (const member of reg.team_members) {
                    if (member.festiverse_id && !member.name) {
                        // Look up user by Festiverse ID
                        const fid = member.festiverse_id.toUpperCase().trim();
                        const { data: found } = await supabase
                            .from('users')
                            .select('name, phone, email, festiverse_id')
                            .eq('festiverse_id', fid)
                            .single();
                        if (found) {
                            resolved.push({ name: found.name, phone: found.phone || '', email: found.email || '', festiverse_id: found.festiverse_id });
                        } else {
                            return res.status(400).json({ success: false, message: `Festiverse ID "${fid}" not found. Please check and try again.` });
                        }
                    } else {
                        resolved.push(member); // Legacy format — already has name/phone/email
                    }
                }
                reg.team_members = resolved;
            }
        } else if (req.body.eventIds) {
            // Legacy format: just event IDs
            regs = req.body.eventIds.map((eventId) => ({
                user_id: userId,
                event_id: eventId,
                team_members: [],
            }));
        } else {
            return res.status(400).json({ success: false, message: 'Please select at least one event.' });
        }

        if (regs.length === 0) {
            return res.status(400).json({ success: false, message: 'Please select at least one event.' });
        }

        // --- GENERATE CUSTOM Registration ID (F26 + First Letter + 4 digits) ---
        const eventIds = regs.map(r => r.event_id);
        const { data: eventsData, error: eventsErr } = await supabase
            .from('events')
            .select('id, name')
            .in('id', eventIds);

        if (eventsErr) throw eventsErr;

        const eventMap = {};
        eventsData.forEach(e => { eventMap[e.id] = e; });

        regs = regs.map(r => {
            const evName = eventMap[r.event_id]?.name || 'Event';
            const firstLetter = evName.trim().charAt(0).toUpperCase();
            const cleanLetter = firstLetter.match(/[A-Z]/) ? firstLetter : 'E';
            const randomNum = Math.floor(1000 + Math.random() * 9000); // 1000-9999
            return {
                ...r,
                custom_id: `F26${cleanLetter}${randomNum}`
            };
        });
        // ------------------------------------------------------------------------

        const { data, error } = await supabase
            .from('event_registrations')
            .upsert(regs, { onConflict: 'user_id,event_id' })
            .select('*, users(name, email), events(name, category, date, team_size)');

        if (error) throw error;

        res.status(201).json({
            success: true,
            message: `Successfully registered for ${data.length} event(s).`,
            registrations: data,
        });

        // Fire off emails asynchronously
        data.forEach((reg) => {
            if (reg.users && reg.users.email && reg.events) {
                const eventDetails = {
                    title: reg.events.name,
                    category: reg.events.category || 'Event',
                    date: reg.events.date || 'TBA',
                    teamSize: reg.events.team_size === 1
                        ? 'Solo'
                        : `${reg.events.team_size} Members`,
                    registrationId: reg.custom_id || reg.id,
                };
                sendEventRegistrationEmail(reg.users.email, reg.users.name, eventDetails).catch(err => {
                    console.error('EVENT REG EMAIL ERROR:', err.message);
                });
            }
        });
    } catch (err) {
        console.error('EVENT REGISTRATION ERROR:', err);
        res.status(500).json({ success: false, message: 'Registration failed: ' + err.message });
    }
});

/**
 * GET /api/events/my-events
 * Get the events the logged-in user has registered for.
 */
router.get('/my-events', verifyToken, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('event_registrations')
            .select('*, events(*)')
            .eq('user_id', req.user.id);

        if (error) throw error;
        res.json({ success: true, registrations: data });
    } catch (err) {
        console.error('MY EVENTS ERROR:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch your events.' });
    }
});

/**
 * GET /api/events/qr/:registrationId
 * Generate a QR code PNG (base64) for a specific event registration.
 */
router.get('/qr/:registrationId', verifyToken, async (req, res) => {
    try {
        const { data: reg, error } = await supabase
            .from('event_registrations')
            .select('*, events(name), users(name)')
            .eq('id', req.params.registrationId)
            .eq('user_id', req.user.id)
            .single();

        if (error || !reg) {
            return res.status(404).json({ success: false, message: 'Registration not found.' });
        }

        // QR payload: JSON with registration ID, user, event
        const qrPayload = JSON.stringify({
            registrationId: reg.id,
            customId: reg.custom_id,
            userId: reg.user_id,
            eventId: reg.event_id,
            userName: reg.users?.name || '',
            eventName: reg.events?.name || '',
        });

        const qrDataUrl = await QRCode.toDataURL(qrPayload, {
            width: 300,
            margin: 2,
            color: { dark: '#000000', light: '#ffffff' },
        });

        res.json({ success: true, qrCode: qrDataUrl, registration: reg });
    } catch (err) {
        console.error('QR GENERATE ERROR:', err);
        res.status(500).json({ success: false, message: 'Failed to generate QR code.' });
    }
});

/**
 * GET /api/events/:id
 * Fetch a single event by ID with full details.
 */
router.get('/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error || !data) {
            return res.status(404).json({ success: false, message: 'Event not found.' });
        }
        res.json({ success: true, event: data });
    } catch (err) {
        console.error('EVENT DETAIL ERROR:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch event.' });
    }
});

module.exports = router;
