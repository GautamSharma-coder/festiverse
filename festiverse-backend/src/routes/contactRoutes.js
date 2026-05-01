const express = require('express');
const supabase = require('../config/supabaseClient');
const { sendContactConfirmationEmail } = require('../config/emailClient');
const { rateLimit } = require('../middlewares/rateLimit');
const { isValidEmail, enforceMaxLength } = require('../middlewares/sanitize');

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

        if (!isValidEmail(email)) {
            return res.status(400).json({ success: false, message: 'Only Gmail addresses (@gmail.com) are accepted.' });
        }

        // Enforce field length limits
        const sanitizedName = enforceMaxLength(name, 100);
        const sanitizedMessage = enforceMaxLength(message, 1000);
        const sanitizedEmail = enforceMaxLength(email, 254);

        const { data, error } = await supabase
            .from('messages')
            .insert([{ name: sanitizedName, email: sanitizedEmail, message: sanitizedMessage }])
            .select()
            .single();

        if (error) throw error;
        
        // Send confirmation email asynchronously
        sendContactConfirmationEmail(email, name).catch(err => {
            console.error('CONTACT EMAIL ERROR:', err.message);
        });

        res.status(201).json({ success: true, message: 'Message received!' });
    } catch (err) {
        console.error('CONTACT ERROR:', err);
        res.status(500).json({ success: false, message: 'Failed to send message.' });
    }
});

module.exports = router;
