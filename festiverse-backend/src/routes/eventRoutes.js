const express = require('express');
const supabase = require('../config/supabaseClient');
const { verifyToken } = require('../middlewares/authMiddleware');

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

        const { data, error } = await supabase
            .from('event_registrations')
            .upsert(regs, { onConflict: 'user_id,event_id' })
            .select();

        if (error) throw error;

        res.status(201).json({
            success: true,
            message: `Successfully registered for ${data.length} event(s).`,
            registrations: data,
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

module.exports = router;
