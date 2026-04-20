const express = require('express');
const supabase = require('../config/supabaseClient');
const { generateCertificate } = require('../utils/pdfGenerator');
const logger = require('../config/logger');

const router = express.Router();

/**
 * GET /api/certificates/check/:festId
 * Returns a list of all certificates available for a user
 */
router.get('/check/:festId', async (req, res) => {
    try {
        const { festId } = req.params;

        // 1. Fetch User
        const { data: user, error: userErr } = await supabase
            .from('users')
            .select('id, name, festiverse_id')
            .eq('festiverse_id', festId.toUpperCase())
            .single();

        if (userErr || !user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        const availableCerts = [];

        // 2. Fetch Results (Achievements)
        const { data: results } = await supabase
            .from('results')
            .select('event_id, position, events(name, date)')
            .eq('user_id', user.id);

        if (results) {
            results.forEach(r => {
                availableCerts.push({
                    event_id: r.event_id,
                    event_name: r.events.name,
                    date: r.events.date,
                    type: 'Achievement',
                    rank: r.position === 1 ? '1st' : r.position === 2 ? '2nd' : r.position === 3 ? '3rd' : null
                });
            });
        }

        // 3. Fetch Registrations (Participation)
        const { data: regs } = await supabase
            .from('event_registrations')
            .select('event_id, events(name, date)')
            .eq('user_id', user.id);

        if (regs) {
            regs.forEach(reg => {
                // Only add if not already in as achievement (or show both? usually achievement covers participation)
                const exists = availableCerts.find(c => c.event_id === reg.event_id);
                if (!exists) {
                    availableCerts.push({
                        event_id: reg.event_id,
                        event_name: reg.events.name,
                        date: reg.events.date,
                        type: 'Participation'
                    });
                }
            });
        }

        res.json({ success: true, certificates: availableCerts, userName: user.name });

    } catch (err) {
        logger.error('CERTIFICATE CHECK ERROR', { message: err.message });
        res.status(500).json({ success: false, message: 'Failed to check certificates.' });
    }
});

/**
 * GET /api/certificates/download/:festId
 * Downloads a certificate for a user (Festiverse ID)
 */
router.get('/download/:festId', async (req, res) => {
    try {
        const { festId } = req.params;
        const { event_id } = req.query;

        // 1. Fetch User
        const { data: user, error: userErr } = await supabase
            .from('users')
            .select('id, name, festiverse_id')
            .eq('festiverse_id', festId.toUpperCase())
            .single();

        if (userErr || !user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        let certData = null;

        // 2. Check for Results (Achievement)
        let resultQuery = supabase
            .from('results')
            .select('*, events(name, date)')
            .eq('user_id', user.id);
        
        if (event_id) resultQuery = resultQuery.eq('event_id', event_id);
        
        const { data: results } = await resultQuery;

        if (results && results.length > 0) {
            const res = results[0];
            certData = {
                name: user.name,
                eventName: res.events.name,
                date: res.events.date,
                rank: res.position === 1 ? '1st' : res.position === 2 ? '2nd' : res.position === 3 ? '3rd' : null,
                type: 'Achievement'
            };
        } else {
            // 3. Check for participation
            let regQuery = supabase
                .from('event_registrations')
                .select('*, events(name, date)')
                .eq('user_id', user.id);
            
            if (event_id) regQuery = regQuery.eq('event_id', event_id);
            
            const { data: regs } = await regQuery;
            
            if (regs && regs.length > 0) {
                const reg = regs[0];
                certData = {
                    name: user.name,
                    eventName: reg.events.name,
                    date: reg.events.date,
                    type: 'Participation'
                };
            }
        }

        if (!certData) {
            return res.status(404).json({ success: false, message: 'No certificate records found.' });
        }

        // 4. Generate PDF
        const pdfBuffer = await generateCertificate(certData);

        // 5. Stream to Client
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Certificate_${festId}_${certData.eventName.replace(/\s+/g, '_')}.pdf`);
        res.send(pdfBuffer);

    } catch (err) {
        logger.error('CERTIFICATE DOWNLOAD ERROR', { message: err.message });
        res.status(500).json({ success: false, message: 'Failed to generate certificate.' });
    }
});

module.exports = router;
