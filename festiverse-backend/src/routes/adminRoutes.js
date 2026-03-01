const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const supabase = require('../config/supabaseClient');
const { verifyToken, verifyAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// ─── Multer config for file uploads (team images, gallery images) ───
const storage = multer.memoryStorage(); // Store in memory so we can upload to Supabase Storage
const upload = multer({
    storage,
    limits: { fileSize: 15 * 1024 * 1024 }, // 15MB max
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|webp|gif/;
        const ext = allowed.test(path.extname(file.originalname).toLowerCase());
        const mime = allowed.test(file.mimetype);
        if (ext && mime) return cb(null, true);
        cb(new Error('Only image files are allowed.'));
    },
});

// ───────────────────────────────────────────────────
// POST /api/admin/login
// ───────────────────────────────────────────────────
router.post('/login', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '4h' });
        res.json({ success: true, token });
    } else {
        res.status(401).json({ success: false, message: 'Invalid admin password.' });
    }
});

// ───────────────────────────────────────────────────
// GET /api/admin/registrations
// ───────────────────────────────────────────────────
router.get('/registrations', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('event_registrations')
            .select('*, users(*), events(*)')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json({ success: true, registrations: data });
    } catch (err) {
        console.error('ADMIN REGISTRATIONS ERROR:', err);
        res.status(500).json({ success: false, message: 'Fetch error.' });
    }
});

// ───────────────────────────────────────────────────
// GET /api/admin/messages
// ───────────────────────────────────────────────────
router.get('/messages', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json({ success: true, messages: data });
    } catch (err) {
        console.error('ADMIN MESSAGES ERROR:', err);
        res.status(500).json({ success: false, message: 'Fetch error.' });
    }
});

// ───────────────────────────────────────────────────
// DELETE /api/admin/messages/:id
// ───────────────────────────────────────────────────
router.delete('/messages/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { error } = await supabase
            .from('messages')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ success: true, message: 'Message deleted.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Delete error.' });
    }
});

// ───────────────────────────────────────────────────
// GET /api/admin/users
// ───────────────────────────────────────────────────
router.get('/users', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json({ success: true, users: data });
    } catch (err) {
        console.error('ADMIN USERS ERROR:', err);
        res.status(500).json({ success: false, message: 'Fetch error.' });
    }
});

// ───────────────────────────────────────────────────
// POST /api/admin/gallery  — Upload an image
// ───────────────────────────────────────────────────
router.post('/gallery', verifyToken, verifyAdmin, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image file uploaded.' });
        }

        const { title, category } = req.body;
        const fileName = `gallery/${Date.now()}-${req.file.originalname.replace(/\s+/g, '_')}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('assets')
            .upload(fileName, req.file.buffer, {
                contentType: req.file.mimetype,
                upsert: false,
            });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage.from('assets').getPublicUrl(fileName);

        // Save record in database
        const { data: imageRecord, error: dbError } = await supabase
            .from('gallery')
            .insert([{
                filename: fileName,
                url: urlData.publicUrl,
                title: title || '',
                category: category || 'general',
            }])
            .select()
            .single();

        if (dbError) throw dbError;

        res.status(201).json({ success: true, image: imageRecord });
    } catch (err) {
        console.error('GALLERY UPLOAD ERROR:', err);
        res.status(500).json({ success: false, message: 'Upload error: ' + err.message });
    }
});

// ───────────────────────────────────────────────────
// DELETE /api/admin/gallery/:id
// ───────────────────────────────────────────────────
router.delete('/gallery/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        // Get the image record first to delete from storage
        const { data: image, error: fetchErr } = await supabase
            .from('gallery')
            .select('filename')
            .eq('id', req.params.id)
            .single();

        if (fetchErr || !image) {
            return res.status(404).json({ success: false, message: 'Image not found.' });
        }

        // Delete from storage
        await supabase.storage.from('assets').remove([image.filename]);

        // Delete from database
        const { error: delErr } = await supabase
            .from('gallery')
            .delete()
            .eq('id', req.params.id);

        if (delErr) throw delErr;

        res.json({ success: true, message: 'Image deleted.' });
    } catch (err) {
        console.error('GALLERY DELETE ERROR:', err);
        res.status(500).json({ success: false, message: 'Delete error.' });
    }
});

// ───────────────────────────────────────────────────
// POST /api/admin/team  — Add a team member with image
// ───────────────────────────────────────────────────
router.post('/team', verifyToken, verifyAdmin, upload.single('image'), async (req, res) => {
    try {
        const { name, role, bio, social_link } = req.body;

        if (!name || !role) {
            return res.status(400).json({ success: false, message: 'Name and role are required.' });
        }

        let imageUrl = null;

        // Upload image if provided
        if (req.file) {
            const fileName = `team/${Date.now()}-${req.file.originalname.replace(/\s+/g, '_')}`;

            const { error: uploadError } = await supabase.storage
                .from('assets')
                .upload(fileName, req.file.buffer, {
                    contentType: req.file.mimetype,
                    upsert: false,
                });

            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage.from('assets').getPublicUrl(fileName);
            imageUrl = urlData.publicUrl;
        }

        const { data: member, error: dbError } = await supabase
            .from('team')
            .insert([{
                name,
                role,
                bio: bio || '',
                social_link: social_link || '',
                image_url: imageUrl,
            }])
            .select()
            .single();

        if (dbError) throw dbError;

        res.status(201).json({ success: true, member });
    } catch (err) {
        console.error('TEAM ADD ERROR:', err);
        res.status(500).json({ success: false, message: 'Failed to add team member: ' + err.message });
    }
});

// ───────────────────────────────────────────────────
// DELETE /api/admin/team/:id
// ───────────────────────────────────────────────────
router.delete('/team/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { data: member, error: fetchErr } = await supabase
            .from('team')
            .select('image_url')
            .eq('id', req.params.id)
            .single();

        if (fetchErr || !member) {
            return res.status(404).json({ success: false, message: 'Team member not found.' });
        }

        // Try to remove image from storage if it exists
        if (member.image_url) {
            const storagePath = member.image_url.split('/storage/v1/object/public/assets/')[1];
            if (storagePath) {
                await supabase.storage.from('assets').remove([storagePath]);
            }
        }

        const { error: delErr } = await supabase
            .from('team')
            .delete()
            .eq('id', req.params.id);

        if (delErr) throw delErr;

        res.json({ success: true, message: 'Team member removed.' });
    } catch (err) {
        console.error('TEAM DELETE ERROR:', err);
        res.status(500).json({ success: false, message: 'Delete error.' });
    }
});

// ───────────────────────────────────────────────────
// POST /api/admin/events  — Add a new event
// ───────────────────────────────────────────────────
router.post('/events', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { name, location, date, description } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: 'Event name is required.' });
        }

        const { data, error } = await supabase
            .from('events')
            .insert([{ name, location: location || '', date: date || null, description: description || '' }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json({ success: true, event: data });
    } catch (err) {
        console.error('EVENT ADD ERROR:', err);
        res.status(500).json({ success: false, message: 'Failed to add event.' });
    }
});

// ───────────────────────────────────────────────────
// DELETE /api/admin/events/:id
// ───────────────────────────────────────────────────
router.delete('/events/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { error } = await supabase
            .from('events')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ success: true, message: 'Event deleted.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Delete error.' });
    }
});

module.exports = router;
