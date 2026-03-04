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
// PUT /api/admin/users/:id
// ───────────────────────────────────────────────────
router.put('/users/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { name, phone, email, college } = req.body;
        if (!name) return res.status(400).json({ success: false, message: 'Name is required.' });

        const { data: updatedUser, error } = await supabase
            .from('users')
            .update({ name, phone: phone || '', email: email || '', college: college || '' })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        res.json({ success: true, user: updatedUser });
    } catch (err) {
        console.error('USER UPDATE ERROR:', err);
        res.status(500).json({ success: false, message: 'Failed to update user.' });
    }
});

// ───────────────────────────────────────────────────
// DELETE /api/admin/users/:id
// ───────────────────────────────────────────────────
router.delete('/users/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ success: true, message: 'User deleted.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Delete error.' });
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
// PUT /api/admin/gallery/:id
// ───────────────────────────────────────────────────
router.put('/gallery/:id', verifyToken, verifyAdmin, upload.single('image'), async (req, res) => {
    try {
        const { title, category } = req.body;
        const updates = { title, category };

        // If a new image is provided, upload it and update the URL
        if (req.file) {
            // Get the old image record to delete from storage
            const { data: oldImage, error: fetchErr } = await supabase
                .from('gallery')
                .select('filename')
                .eq('id', req.params.id)
                .single();

            if (fetchErr || !oldImage) {
                return res.status(404).json({ success: false, message: 'Image not found.' });
            }

            // Delete old image from storage
            await supabase.storage.from('assets').remove([oldImage.filename]);

            // Upload new image
            const fileName = `gallery/${Date.now()}-${req.file.originalname.replace(/\s+/g, '_')}`;
            const { error: uploadError } = await supabase.storage
                .from('assets')
                .upload(fileName, req.file.buffer, {
                    contentType: req.file.mimetype,
                    upsert: false,
                });

            if (uploadError) throw uploadError;

            // Get new public URL
            const { data: urlData } = supabase.storage.from('assets').getPublicUrl(fileName);
            updates.filename = fileName;
            updates.url = urlData.publicUrl;
        }

        const { data: updatedImage, error: dbError } = await supabase
            .from('gallery')
            .update(updates)
            .eq('id', req.params.id)
            .select()
            .single();

        if (dbError) throw dbError;

        res.json({ success: true, image: updatedImage });
    } catch (err) {
        console.error('GALLERY UPDATE ERROR:', err);
        res.status(500).json({ success: false, message: 'Update error: ' + err.message });
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
        const { name, role, bio, social_link, society, category } = req.body;

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
                society: society || '',
                category: category || 'Coordinator',
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
// PUT /api/admin/team/:id
// ───────────────────────────────────────────────────
router.put('/team/:id', verifyToken, verifyAdmin, upload.single('image'), async (req, res) => {
    try {
        const { name, role, bio, social_link, society, category } = req.body;

        if (!name || !role) {
            return res.status(400).json({ success: false, message: 'Name and role are required.' });
        }

        const updates = { name, role, bio: bio || '', social_link: social_link || '', society: society || '', category: category || 'Coordinator' };

        // Upload new image if provided
        if (req.file) {
            // Get the old image to remove
            const { data: oldMember } = await supabase
                .from('team')
                .select('image_url')
                .eq('id', req.params.id)
                .single();

            if (oldMember && oldMember.image_url) {
                const storagePath = oldMember.image_url.split('/storage/v1/object/public/assets/')[1];
                if (storagePath) {
                    await supabase.storage.from('assets').remove([storagePath]);
                }
            }

            const fileName = `team/${Date.now()}-${req.file.originalname.replace(/\s+/g, '_')}`;

            const { error: uploadError } = await supabase.storage
                .from('assets')
                .upload(fileName, req.file.buffer, {
                    contentType: req.file.mimetype,
                    upsert: false,
                });

            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage.from('assets').getPublicUrl(fileName);
            updates.image_url = urlData.publicUrl;
        }

        const { data: updatedMember, error: dbError } = await supabase
            .from('team')
            .update(updates)
            .eq('id', req.params.id)
            .select()
            .single();

        if (dbError) throw dbError;

        res.json({ success: true, member: updatedMember });
    } catch (err) {
        console.error('TEAM UPDATE ERROR:', err);
        res.status(500).json({ success: false, message: 'Failed to update team member: ' + err.message });
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
// ───────────────────────────────────────────────────
// PUT /api/admin/events/:id
// ───────────────────────────────────────────────────
router.put('/events/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { name, location, date, description } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: 'Event name is required.' });
        }

        const { data: updatedEvent, error } = await supabase
            .from('events')
            .update({ name, location: location || '', date: date || null, description: description || '' })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        res.json({ success: true, event: updatedEvent });
    } catch (err) {
        console.error('EVENT UPDATE ERROR:', err);
        res.status(500).json({ success: false, message: 'Failed to update event.' });
    }
});

// ───────────────────────────────────────────────────
// GET /api/admin/notices  — List all notices (admin, includes inactive)
// ───────────────────────────────────────────────────
router.get('/notices', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('notices')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        res.json({ success: true, notices: data });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Fetch error.' });
    }
});

// ───────────────────────────────────────────────────
// POST /api/admin/notices  — Add a notice
// ───────────────────────────────────────────────────
router.post('/notices', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { title, description, color } = req.body;
        if (!title) return res.status(400).json({ success: false, message: 'Title is required.' });

        const { data, error } = await supabase
            .from('notices')
            .insert([{ title, description: description || '', color: color || '#3b82f6' }])
            .select()
            .single();
        if (error) throw error;
        res.status(201).json({ success: true, notice: data });
    } catch (err) {
        console.error('NOTICE ADD ERROR:', err);
        res.status(500).json({ success: false, message: 'Failed to add notice.' });
    }
});

// ───────────────────────────────────────────────────
// PUT /api/admin/notices/:id
// ───────────────────────────────────────────────────
router.put('/notices/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { title, description, color } = req.body;
        if (!title) return res.status(400).json({ success: false, message: 'Title is required.' });

        const { data: updatedNotice, error } = await supabase
            .from('notices')
            .update({ title, description: description || '', color: color || '#3b82f6' })
            .eq('id', req.params.id)
            .select()
            .single();
        if (error) throw error;
        res.json({ success: true, notice: updatedNotice });
    } catch (err) {
        console.error('NOTICE UPDATE ERROR:', err);
        res.status(500).json({ success: false, message: 'Failed to update notice.' });
    }
});

// ───────────────────────────────────────────────────
// DELETE /api/admin/notices/:id
// ───────────────────────────────────────────────────
router.delete('/notices/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { error } = await supabase.from('notices').delete().eq('id', req.params.id);
        if (error) throw error;
        res.json({ success: true, message: 'Notice deleted.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Delete error.' });
    }
});

module.exports = router;
