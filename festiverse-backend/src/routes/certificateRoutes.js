const express = require('express');
const supabase = require('../config/supabaseClient');
const { generateCertificate } = require('../utils/pdfGenerator');
const { isValidUUID } = require('../middlewares/sanitize');
const { rateLimit } = require('../middlewares/rateLimit');
const logger = require('../config/logger');

const router = express.Router();

// Rate limiter for certificate downloads (PDF generation is CPU-intensive)
const certLimiter = rateLimit({ windowMs: 60000, max: 5, message: 'Too many certificate requests. Please wait a moment.' });

/**
 * GET /api/certificates/check/:festId
 * Returns a list of all certificates available for a user
 */
router.get('/check/:festId', async (req, res) => {
    try {
        const { festId } = req.params;
        
        // SECURITY: Validate Festiverse ID format
        if (!festId || !/^F26[A-Z]{2}\d{4}$/.test(festId.toUpperCase())) {
            return res.status(400).json({ success: false, message: 'Invalid Festiverse ID format.' });
        }

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

        // 2. Fetch Results (Achievements) — only for published events
        const { data: results } = await supabase
            .from('results')
            .select('event_id, position, events(name, date, results_published)')
            .eq('user_id', user.id);

        if (results) {
            results.forEach(r => {
                if (!r.events?.results_published) return; // Skip unpublished
                availableCerts.push({
                    event_id: r.event_id,
                    event_name: r.events.name,
                    date: r.events.date,
                    type: 'Achievement',
                    rank: r.position === 1 ? '1st' : r.position === 2 ? '2nd' : r.position === 3 ? '3rd' : null
                });
            });
        }

        // 3. Fetch Registrations (Participation) — only for published events
        const { data: regs } = await supabase
            .from('event_registrations')
            .select('event_id, events(name, date, results_published)')
            .eq('user_id', user.id);

        if (regs) {
            regs.forEach(reg => {
                if (!reg.events?.results_published) return; // Skip unpublished
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
router.get('/download/:festId', certLimiter, async (req, res) => {
    try {
        const { festId } = req.params;
        const { event_id } = req.query;

        // SECURITY: Validate Festiverse ID format
        if (!festId || !/^F26[A-Z]{2}\d{4}$/.test(festId.toUpperCase())) {
            return res.status(400).json({ success: false, message: 'Invalid Festiverse ID format.' });
        }

        // SECURITY: Validate event_id query param if provided
        if (event_id && !isValidUUID(event_id)) {
            return res.status(400).json({ success: false, message: 'Invalid event ID format.' });
        }

        // 1. Fetch User
        const { data: user, error: userErr } = await supabase
            .from('users')
            .select('id, name, festiverse_id')
            .eq('festiverse_id', festId.toUpperCase())
            .single();

        if (userErr || !user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        // SECURITY: Check if results are published for this event
        if (event_id) {
            const { data: targetEvent } = await supabase
                .from('events')
                .select('results_published')
                .eq('id', event_id)
                .single();

            if (!targetEvent?.results_published) {
                return res.status(403).json({ success: false, message: 'Results for this event have not been published yet.' });
            }
        }

        let certData = null;

        // 2. Check for Results (Achievement)
        let resultQuery = supabase
            .from('results')
            .select('*, events(name, date, results_published)')
            .eq('user_id', user.id);
        
        if (event_id) resultQuery = resultQuery.eq('event_id', event_id);
        
        const { data: results } = await resultQuery;

        if (results && results.length > 0) {
            const r = results.find(r => r.events?.results_published) || null;
            if (r) {
                certData = {
                    name: user.name,
                    eventName: r.events.name,
                    date: r.events.date,
                    rank: r.position === 1 ? '1st' : r.position === 2 ? '2nd' : r.position === 3 ? '3rd' : null,
                    type: 'Achievement'
                };
            }
        }
        
        if (!certData) {
            // 3. Check for participation
            let regQuery = supabase
                .from('event_registrations')
                .select('*, events(name, date, results_published)')
                .eq('user_id', user.id);
            
            if (event_id) regQuery = regQuery.eq('event_id', event_id);
            
            const { data: regs } = await regQuery;
            
            if (regs && regs.length > 0) {
                const reg = regs.find(r => r.events?.results_published) || null;
                if (reg) {
                    certData = {
                        name: user.name,
                        eventName: reg.events.name,
                        date: reg.events.date,
                        type: 'Participation'
                    };
                }
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
