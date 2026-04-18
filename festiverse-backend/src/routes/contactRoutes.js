const express = require('express');
const supabase = require('../config/supabaseClient');
const { rateLimit } = require('../middlewares/rateLimit');

const router = express.Router();
const contactLimiter = rateLimit({ windowMs: 300000, max: 5, message: 'Too many messages. Please wait a few minutes.' });

/**
 * POST /api/contact
 * Saves a contact form message to Supabase.
 */
router.post('/', contactLimiter, async (req, res) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }

        const { data, error } = await supabase
            .from('messages')
            .insert([{ name, email, message }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({ success: true, message: 'Message received!' });
    } catch (err) {
        console.error('CONTACT ERROR:', err);
        res.status(500).json({ success: false, message: 'Failed to send message.' });
    }
});

module.exports = router;
