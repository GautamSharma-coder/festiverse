const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const supabase = require('../config/supabaseClient');
const { rateLimit } = require('../middlewares/rateLimit');

const hiringLimiter = rateLimit({ windowMs: 300000, max: 3, message: 'Too many applications submitted. Please wait a few minutes.' });

// Set up multer to keep files in memory
const storage = multer.memoryStorage();
const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowed = /pdf|doc|docx/;
        const ext = allowed.test(path.extname(file.originalname).toLowerCase());
        if (ext) return cb(null, true);
        cb(new Error('Only PDF, DOC, and DOCX files are allowed.'));
    },
});

/**
 * POST /api/hiring/submit
 * Handles hiring application form submission with resume upload
 */
router.post('/submit', hiringLimiter, upload.single('file'), async (req, res) => {
    try {
        const { role, name, email, phone, reg, roll, branch, batch } = req.body;
        const file = req.file;

        // Basic validation
        if (!role || !name || !email || !phone || !reg || !roll || !branch || !batch || !file) {
            return res.status(400).json({ success: false, message: 'All fields and resume file are required.' });
        }

        // Upload to Supabase Storage
        // Use the assets bucket, inside resumes/ folder
        const fileName = `resumes/${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        
        const { data: storageData, error: storageError } = await supabase
            .storage
            .from('assets')
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
                upsert: false
            });

        if (storageError) {
            console.error('Storage Upload Error:', storageError);
            return res.status(500).json({ success: false, message: 'Failed to upload resume document.' });
        }

        // Get the public URL for the uploaded file
        const { data: publicUrlData } = supabase
            .storage
            .from('assets')
            .getPublicUrl(fileName);

        const resumeUrl = publicUrlData.publicUrl;

        // Save application to database
        const { data, error } = await supabase
            .from('hiring_applications')
            .insert([{
                role,
                name,
                email,
                phone,
                reg_no: reg,
                roll_no: roll,
                branch,
                batch,
                resume_url: resumeUrl
            }])
            .select()
            .single();

        if (error) {
            console.error('DB Insert Error:', error);
            // Optional: could attempt to delete the uploaded file if DB insert fails
            return res.status(500).json({ success: false, message: 'Failed to record application.' });
        }

        res.status(201).json({ success: true, message: 'Application submitted successfully!', data });
    } catch (err) {
        console.error('HIRING SUBMIT ERROR:', err);
        res.status(500).json({ success: false, message: 'An unexpected error occurred.' });
    }
});

module.exports = router;
