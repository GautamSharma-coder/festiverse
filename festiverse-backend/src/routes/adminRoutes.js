const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const supabase = require('../config/supabaseClient');
const { verifyToken, verifyAdmin } = require('../middlewares/authMiddleware');
const { sendResultEmail } = require('../config/emailClient');
const { rateLimit } = require('../middlewares/rateLimit');
const { validateIdParam, enforceMaxLength } = require('../middlewares/sanitize');
const logger = require('../config/logger');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET; // Required — validated at startup
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD; // Required — validated at startup

// Rate limiter for admin login
const adminLoginLimiter = rateLimit({ windowMs: 60000, max: 5, message: 'Too many admin login attempts. Please wait 1 minute.' });

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
router.post('/login', adminLoginLimiter, async (req, res) => {
    const { password } = req.body;
    const clientIp = req.ip || req.socket.remoteAddress;

    if (!password || typeof password !== 'string' || password.length > 128) {
        logger.warn('Admin login: invalid password format', { ip: clientIp });
        return res.status(401).json({ success: false, message: 'Invalid admin password.' });
    }

    try {
        // Support both hashed and plain-text admin passwords for migration
        let isValid = false;
        if (ADMIN_PASSWORD.startsWith('$2b$') || ADMIN_PASSWORD.startsWith('$2a$')) {
            // Admin password is bcrypt-hashed in env
            isValid = await bcrypt.compare(password, ADMIN_PASSWORD);
        } else {
            // Fallback: plain-text comparison (log warning to migrate)
            isValid = password === ADMIN_PASSWORD;
            if (isValid) {
                logger.warn('Admin password is stored as plain-text. Please hash it with bcrypt and update ADMIN_PASSWORD env var.');
            }
        }

        if (isValid) {
            const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '4h' });
            logger.info('Admin login successful', { ip: clientIp });
            res.cookie('festiverse_admin_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                path: '/',
                maxAge: 4 * 60 * 60 * 1000 // 4 hours
            });
            res.json({ success: true, message: 'Admin login successful', token });
        } else {
            logger.warn('Admin login failed: wrong password', { ip: clientIp });
            res.status(401).json({ success: false, message: 'Invalid admin password.' });
        }
    } catch (err) {
        logger.error('Admin login error', { message: err.message, ip: clientIp });
        res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
    }
});

// ───────────────────────────────────────────────────
// GET /api/admin/registrations
// ───────────────────────────────────────────────────
router.get('/registrations', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data, error, count } = await supabase
            .from('event_registrations')
            .select('*, users(*), events(*)', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) throw error;
        res.json({
            success: true,
            registrations: data,
            pagination: { page, limit, total: count }
        });
    } catch (err) {
        logger.error('ADMIN REGISTRATIONS ERROR', { message: err.message });
        res.status(500).json({ success: false, message: 'Fetch error.' });
    }
});

// ───────────────────────────────────────────────────
// GET /api/admin/messages
// ───────────────────────────────────────────────────
router.get('/messages', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data, error, count } = await supabase
            .from('messages')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) throw error;
        res.json({
            success: true,
            messages: data,
            pagination: { page, limit, total: count }
        });
    } catch (err) {
        logger.error('ADMIN MESSAGES ERROR', { message: err.message });
        res.status(500).json({ success: false, message: 'Fetch error.' });
    }
});

// ───────────────────────────────────────────────────
// DELETE /api/admin/messages/:id
// ───────────────────────────────────────────────────
router.delete('/messages/:id', verifyToken, verifyAdmin, validateIdParam, async (req, res) => {
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
// GET /api/admin/analytics
// ───────────────────────────────────────────────────
router.get('/analytics', verifyToken, verifyAdmin, async (req, res) => {
    try {
        // 1. Get unique visitors (all time or filtered by date)
        const { count, error } = await supabase
            .from('visitors')
            .select('*', { count: 'exact', head: true });

        // Get unique IPs
        const { data: uniqueIps, error: ipError } = await supabase
            .from('visitors')
            .select('ip_hash');

        const uniqueCount = uniqueIps ? new Set(uniqueIps.map(v => v.ip_hash)).size : 0;

        if (error || ipError) throw error || ipError;

        // 2. Get live users from the map stored in app
        const liveUsers = req.app.get('liveUsersMap');
        const liveCount = liveUsers ? liveUsers.size : 0;

        res.json({
            success: true,
            uniqueVisitors: uniqueCount,
            totalLogs: count,
            liveUsers: liveCount
        });
    } catch (err) {
        logger.error('ADMIN ANALYTICS ERROR', { message: err.message });
        res.status(500).json({ success: false, message: 'Fetch error.' });
    }
});

// ───────────────────────────────────────────────────
// GET /api/admin/users
// ───────────────────────────────────────────────────
router.get('/users', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data, error, count } = await supabase
            .from('users')
            .select('id, name, email, phone, college, role, has_paid, avatar_url, festiverse_id, created_at', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) throw error;
        res.json({
            success: true,
            users: data,
            pagination: { page, limit, total: count }
        });
    } catch (err) {
        logger.error('ADMIN USERS ERROR', { message: err.message });
        res.status(500).json({ success: false, message: 'Fetch error.' });
    }
});

// ───────────────────────────────────────────────────
// PUT /api/admin/users/:id
// ───────────────────────────────────────────────────
router.put('/users/:id', verifyToken, verifyAdmin, validateIdParam, async (req, res) => {
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
        logger.error('USER UPDATE ERROR', { message: err.message });
        res.status(500).json({ success: false, message: 'Failed to update user.' });
    }
});

// ───────────────────────────────────────────────────
// DELETE /api/admin/users/:id
// ───────────────────────────────────────────────────
router.delete('/users/:id', verifyToken, verifyAdmin, validateIdParam, async (req, res) => {
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
        logger.error('GALLERY UPLOAD ERROR', { message: err.message });
        res.status(500).json({ success: false, message: 'Failed to upload image.' });
    }
});

// ───────────────────────────────────────────────────
// PUT /api/admin/gallery/:id
// ───────────────────────────────────────────────────
router.put('/gallery/:id', verifyToken, verifyAdmin, validateIdParam, upload.single('image'), async (req, res) => {
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
        logger.error('GALLERY UPDATE ERROR', { message: err.message });
        res.status(500).json({ success: false, message: 'Failed to update image.' });
    }
});

// ───────────────────────────────────────────────────
// DELETE /api/admin/gallery/:id
// ───────────────────────────────────────────────────
router.delete('/gallery/:id', verifyToken, verifyAdmin, validateIdParam, async (req, res) => {
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
        logger.error('GALLERY DELETE ERROR', { message: err.message });
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
        logger.error('TEAM ADD ERROR', { message: err.message });
        res.status(500).json({ success: false, message: 'Failed to add team member.' });
    }
});

// ───────────────────────────────────────────────────
// DELETE /api/admin/team/:id
// ───────────────────────────────────────────────────
router.delete('/team/:id', verifyToken, verifyAdmin, validateIdParam, async (req, res) => {
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
        logger.error('TEAM DELETE ERROR', { message: err.message });
        res.status(500).json({ success: false, message: 'Delete error.' });
    }
});

// ───────────────────────────────────────────────────
// POST /api/admin/faculty  — Add a faculty member with image
// ───────────────────────────────────────────────────
router.post('/faculty', verifyToken, verifyAdmin, upload.single('image'), async (req, res) => {
    try {
        const { name, role, department } = req.body;

        if (!name || !role) {
            return res.status(400).json({ success: false, message: 'Name and role are required.' });
        }

        let imageUrl = null;

        if (req.file) {
            const fileName = `faculty/${Date.now()}-${req.file.originalname.replace(/\s+/g, '_')}`;

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
            .from('faculty')
            .insert([{
                name,
                role,
                department: department || '',
                image_url: imageUrl,
            }])
            .select()
            .single();

        if (dbError) throw dbError;

        res.status(201).json({ success: true, member });
    } catch (err) {
        logger.error('FACULTY ADD ERROR', { message: err.message });
        res.status(500).json({ success: false, message: 'Failed to add faculty member.' });
    }
});

// ───────────────────────────────────────────────────
// PUT /api/admin/faculty/:id
// ───────────────────────────────────────────────────
router.put('/faculty/:id', verifyToken, verifyAdmin, validateIdParam, upload.single('image'), async (req, res) => {
    try {
        const { name, role, department } = req.body;

        if (!name || !role) {
            return res.status(400).json({ success: false, message: 'Name and role are required.' });
        }

        const updates = { name, role, department: department || '' };

        if (req.file) {
            const { data: oldMember } = await supabase
                .from('faculty')
                .select('image_url')
                .eq('id', req.params.id)
                .single();

            if (oldMember && oldMember.image_url) {
                const storagePath = oldMember.image_url.split('/storage/v1/object/public/assets/')[1];
                if (storagePath) {
                    await supabase.storage.from('assets').remove([storagePath]);
                }
            }

            const fileName = `faculty/${Date.now()}-${req.file.originalname.replace(/\s+/g, '_')}`;

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
            .from('faculty')
            .update(updates)
            .eq('id', req.params.id)
            .select()
            .single();

        if (dbError) throw dbError;

        res.json({ success: true, member: updatedMember });
    } catch (err) {
        logger.error('FACULTY UPDATE ERROR', { message: err.message });
        res.status(500).json({ success: false, message: 'Failed to update faculty member.' });
    }
});

// ───────────────────────────────────────────────────
// DELETE /api/admin/faculty/:id
// ───────────────────────────────────────────────────
router.delete('/faculty/:id', verifyToken, verifyAdmin, validateIdParam, async (req, res) => {
    try {
        const { data: member, error: fetchErr } = await supabase
            .from('faculty')
            .select('image_url')
            .eq('id', req.params.id)
            .single();

        if (fetchErr || !member) {
            return res.status(404).json({ success: false, message: 'Faculty member not found.' });
        }

        if (member.image_url) {
            const storagePath = member.image_url.split('/storage/v1/object/public/assets/')[1];
            if (storagePath) {
                await supabase.storage.from('assets').remove([storagePath]);
            }
        }

        const { error: delErr } = await supabase
            .from('faculty')
            .delete()
            .eq('id', req.params.id);

        if (delErr) throw delErr;

        res.json({ success: true, message: 'Faculty member removed.' });
    } catch (err) {
        logger.error('FACULTY DELETE ERROR', { message: err.message });
        res.status(500).json({ success: false, message: 'Delete error.' });
    }
});

// ───────────────────────────────────────────────────
// POST /api/admin/events  — Add a new event
// ───────────────────────────────────────────────────
router.post('/events', verifyToken, verifyAdmin, upload.single('image'), async (req, res) => {
    try {
        logger.debug('POST EVENT', { body: req.body, hasFile: !!req.file });
        const { name, location, date, description, rules, schedule, category, prizes } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: 'Event name is required.' });
        }

        let imageUrl = '';
        if (req.file) {
            const fileName = `events/${Date.now()}-${req.file.originalname.replace(/\s+/g, '_')}`;
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

        let parsedSchedule = [];
        if (schedule) {
            try { parsedSchedule = JSON.parse(schedule); } catch (e) { parsedSchedule = [schedule]; }
        }

        const { data, error } = await supabase
            .from('events')
            .insert([{
                name,
                location: location || '',
                date: date || null,
                description: description || '',
                rules: rules || '',
                schedule: parsedSchedule,
                image_url: imageUrl,
                category: category || 'general',
                prizes: prizes || ''
            }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json({ success: true, event: data });
    } catch (err) {
        logger.error('EVENT ADD ERROR', { message: err.message });
        res.status(500).json({ success: false, message: 'Failed to add event.' });
    }
});

// ───────────────────────────────────────────────────
// PUT /api/admin/team/:id
// ───────────────────────────────────────────────────
router.put('/team/:id', verifyToken, verifyAdmin, validateIdParam, upload.single('image'), async (req, res) => {
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
        logger.error('TEAM UPDATE ERROR', { message: err.message });
        res.status(500).json({ success: false, message: 'Failed to update team member.' });
    }
});

// ───────────────────────────────────────────────────
// DELETE /api/admin/events/:id
// ───────────────────────────────────────────────────
router.delete('/events/:id', verifyToken, verifyAdmin, validateIdParam, async (req, res) => {
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
router.put('/events/:id', verifyToken, verifyAdmin, validateIdParam, upload.single('image'), async (req, res) => {
    try {
        logger.debug('PUT EVENT', { body: req.body, hasFile: !!req.file });
        const { name, location, date, description, rules, schedule, category, prizes } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: 'Event name is required.' });
        }

        const updates = {
            name,
            location: location || '',
            date: date || null,
            description: description || '',
            rules: rules || '',
            category: category || 'general',
            prizes: prizes || ''
        };

        if (schedule !== undefined) {
            try { updates.schedule = JSON.parse(schedule); } catch (e) { updates.schedule = schedule; }
        }

        if (req.file) {
            // Get old image to delete
            const { data: oldEvent } = await supabase
                .from('events')
                .select('image_url')
                .eq('id', req.params.id)
                .single();

            if (oldEvent && oldEvent.image_url) {
                const storagePath = oldEvent.image_url.split('/storage/v1/object/public/assets/')[1];
                if (storagePath) {
                    await supabase.storage.from('assets').remove([storagePath]);
                }
            }

            const fileName = `events/${Date.now()}-${req.file.originalname.replace(/\s+/g, '_')}`;
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

        const { data: updatedEvent, error } = await supabase
            .from('events')
            .update(updates)
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        res.json({ success: true, event: updatedEvent });
    } catch (err) {
        logger.error('EVENT UPDATE ERROR', { message: err.message });
        res.status(500).json({ success: false, message: 'Failed to update event.' });
    }
});

// ───────────────────────────────────────────────────
// POST /api/admin/events/:id/toggle-publish
// Toggle results_published flag for an event
// ───────────────────────────────────────────────────
router.post('/events/:id/toggle-publish', verifyToken, verifyAdmin, validateIdParam, async (req, res) => {
    try {
        // Get current state
        const { data: event, error: fetchErr } = await supabase
            .from('events')
            .select('id, name, results_published')
            .eq('id', req.params.id)
            .single();

        if (fetchErr || !event) {
            return res.status(404).json({ success: false, message: 'Event not found.' });
        }

        const newState = !event.results_published;

        const { data: updated, error: updateErr } = await supabase
            .from('events')
            .update({ results_published: newState })
            .eq('id', req.params.id)
            .select()
            .single();

        if (updateErr) throw updateErr;

        logger.info(`Event "${event.name}" results ${newState ? 'PUBLISHED' : 'UNPUBLISHED'}`, { eventId: req.params.id });
        res.json({
            success: true,
            message: `Results ${newState ? 'published' : 'unpublished'} for ${event.name}.`,
            event: updated,
        });
    } catch (err) {
        logger.error('TOGGLE PUBLISH ERROR', { message: err.message });
        res.status(500).json({ success: false, message: 'Failed to toggle publish status.' });
    }
});

// ───────────────────────────────────────────────────
// POST /api/admin/events/bulk-toggle-publish
// Set results_published flag for ALL events at once
// ───────────────────────────────────────────────────
router.post('/events/bulk-toggle-publish', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { publish } = req.body; // boolean
        if (publish === undefined) {
            return res.status(400).json({ success: false, message: 'Publish status (boolean) is required.' });
        }

        const { data, error } = await supabase
            .from('events')
            .update({ results_published: publish })
            .neq('id', '00000000-0000-0000-0000-000000000000') // Matches all rows if not using a filter
            .select();

        if (error) throw error;

        logger.info(`Bulk results ${publish ? 'PUBLISHED' : 'UNPUBLISHED'} for all events`, { count: data.length });
        res.json({
            success: true,
            message: `Successfully ${publish ? 'published' : 'unpublished'} all events.`,
            count: data.length
        });
    } catch (err) {
        logger.error('BULK TOGGLE PUBLISH ERROR', { message: err.message });
        res.status(500).json({ success: false, message: 'Failed to bulk update publish status.' });
    }
});

// ───────────────────────────────────────────────────
// GET /api/admin/notices  — List all notices (admin, includes inactive)
// ───────────────────────────────────────────────────
router.get('/notices', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data, error, count } = await supabase
            .from('notices')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(from, to);
        if (error) throw error;
        res.json({
            success: true,
            notices: data,
            pagination: { page, limit, total: count }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Fetch error.' });
    }
});

// ───────────────────────────────────────────────────
// POST /api/admin/notices  — Add a notice
// ───────────────────────────────────────────────────
router.post('/notices', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { title, description, color, link_url, link_text } = req.body;
        if (!title) return res.status(400).json({ success: false, message: 'Title is required.' });

        const { data, error } = await supabase
            .from('notices')
            .insert([{ title, description: description || '', color: color || '#3b82f6', link_url: link_url || '', link_text: link_text || '' }])
            .select()
            .single();
        if (error) throw error;
        res.status(201).json({ success: true, notice: data });
    } catch (err) {
        logger.error('NOTICE ADD ERROR', { message: err.message });
        res.status(500).json({ success: false, message: 'Failed to add notice.' });
    }
});

// ───────────────────────────────────────────────────
// PUT /api/admin/notices/:id
// ───────────────────────────────────────────────────
router.put('/notices/:id', verifyToken, verifyAdmin, validateIdParam, async (req, res) => {
    try {
        const { title, description, color, link_url, link_text } = req.body;
        if (!title) return res.status(400).json({ success: false, message: 'Title is required.' });

        const { data: updatedNotice, error } = await supabase
            .from('notices')
            .update({ title, description: description || '', color: color || '#3b82f6', link_url: link_url || '', link_text: link_text || '' })
            .eq('id', req.params.id)
            .select()
            .single();
        if (error) throw error;
        res.json({ success: true, notice: updatedNotice });
    } catch (err) {
        logger.error('NOTICE UPDATE ERROR', { message: err.message });
        res.status(500).json({ success: false, message: 'Failed to update notice.' });
    }
});

// ───────────────────────────────────────────────────
// DELETE /api/admin/notices/:id
// ───────────────────────────────────────────────────
router.delete('/notices/:id', verifyToken, verifyAdmin, validateIdParam, async (req, res) => {
    try {
        const { error } = await supabase.from('notices').delete().eq('id', req.params.id);
        if (error) throw error;
        res.json({ success: true, message: 'Notice deleted.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Delete error.' });
    }
});

// ═══════════════════════════════════════════════════════════
// QR CHECK-IN
// ═══════════════════════════════════════════════════════════

// POST /api/admin/checkin — Validate QR and mark attendance
router.post('/checkin', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { registrationId } = req.body;
        if (!registrationId) {
            return res.status(400).json({ success: false, message: 'Registration ID is required.' });
        }

        // Determine if this is a UUID or a custom_id (e.g., F26D1234)
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(registrationId);
        const matchColumn = isUuid ? 'id' : 'custom_id';

        // Get registration
        const { data: reg, error: fetchErr } = await supabase
            .from('event_registrations')
            .select('*, users(name, phone, has_paid), events(name)')
            .eq(matchColumn, registrationId)
            .single();

        if (fetchErr || !reg) {
            return res.status(404).json({ success: false, message: 'Registration not found.' });
        }

        if (reg.checked_in) {
            return res.status(400).json({
                success: false,
                message: `Already checked in at ${new Date(reg.checked_in_at).toLocaleString()}`,
                registration: reg,
            });
        }

        // Mark as checked in
        const { data: updated, error: updateErr } = await supabase
            .from('event_registrations')
            .update({ checked_in: true, checked_in_at: new Date().toISOString() })
            .eq('id', reg.id) // Use the resolved ID just in case
            .select('*, users(name, phone, has_paid), events(name)')
            .single();

        if (updateErr) throw updateErr;

        res.json({
            success: true,
            message: `✅ ${updated.users?.name} checked in for ${updated.events?.name}`,
            registration: updated,
        });
    } catch (err) {
        logger.error('CHECKIN ERROR', { message: err.message });
        res.status(500).json({ success: false, message: 'Check-in failed. Please try again.' });
    }
});

// ═══════════════════════════════════════════════════════════
// RESULTS CRUD
// ═══════════════════════════════════════════════════════════

router.post('/results', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { event_id, position, participant_name, participant_college, participant_email, score } = req.body;
        if (!event_id || !position || !participant_name) {
            return res.status(400).json({ success: false, message: 'Event, position, and participant name are required.' });
        }
        const { data, error } = await supabase
            .from('results')
            .insert([{
                event_id,
                position,
                participant_name,
                participant_college: participant_college || '',
                participant_email: participant_email || '',
                user_id: req.body.user_id || null, // Allow frontend to pass matched user_id
                score: score || ''
            }])
            .select('*, events(name)')
            .single();
        if (error) throw error;

        // Try to dispatch result email & link account if not provided
        try {
            let targetEmail = participant_email;
            let targetName = participant_name;
            let matchedUserId = data.user_id;

            // If no user_id or email, try to find registered user
            if (!matchedUserId || !targetEmail) {
                // Query users who are registered for this event
                const { data: match } = await supabase
                    .from('users')
                    .select('id, name, email, event_registrations!inner(event_id)')
                    .eq('event_registrations.event_id', event_id)
                    .or(`email.ilike.${participant_name},name.ilike.${participant_name}`)
                    .limit(1)
                    .single();

                if (match) {
                    if (!matchedUserId) matchedUserId = match.id;
                    if (!targetEmail) targetEmail = match.email;
                    if (!targetName) targetName = match.name || participant_name;

                    // Update result with matched user_id if we found one
                    if (!data.user_id && matchedUserId) {
                        await supabase.from('results').update({ user_id: matchedUserId }).eq('id', data.id);
                    }
                }
            }

            if (targetEmail) {
                const resultDetails = {
                    eventTitle: data.events.name,
                    position: position,
                    score: score || 'N/A',
                    certificateUrl: `${process.env.FRONTEND_URL || 'https://www.udaangecsamastipur.in'}/certificates`
                };
                sendResultEmail(targetEmail, targetName, resultDetails)
                    .catch(e => console.error('RESULT EMAIL ERR:', e.message));
            }
        } catch (emailErr) {
            console.error('Failed to look up user for result email:', emailErr.message);
        }

        res.status(201).json({ success: true, result: data });
    } catch (err) {
        logger.error('RESULT ADD ERROR', { message: err.message });
        res.status(500).json({ success: false, message: 'Failed to add result.' });
    }
});

router.put('/results/:id', verifyToken, verifyAdmin, validateIdParam, async (req, res) => {
    try {
        const { event_id, position, participant_name, participant_college, participant_email, score } = req.body;
        const updates = {};
        if (event_id !== undefined) updates.event_id = event_id;
        if (position !== undefined) updates.position = position;
        if (participant_name !== undefined) updates.participant_name = participant_name;
        if (participant_college !== undefined) updates.participant_college = participant_college;
        if (participant_email !== undefined) updates.participant_email = participant_email;
        if (score !== undefined) updates.score = score;

        const { data, error } = await supabase
            .from('results')
            .update(updates)
            .eq('id', req.params.id)
            .select('*, events(name)')
            .single();
        if (error) throw error;
        res.json({ success: true, result: data });
    } catch (err) {
        logger.error('RESULT UPDATE ERROR', { message: err.message });
        res.status(500).json({ success: false, message: 'Failed to update result.' });
    }
});

router.delete('/results/:id', verifyToken, verifyAdmin, validateIdParam, async (req, res) => {
    try {
        const { error } = await supabase.from('results').delete().eq('id', req.params.id);
        if (error) throw error;
        res.json({ success: true, message: 'Result deleted.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Delete error.' });
    }
});

// ═══════════════════════════════════════════════════════════
// SPONSORS CRUD
// ═══════════════════════════════════════════════════════════

router.get('/sponsors', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data, error, count } = await supabase
            .from('sponsors')
            .select('*', { count: 'exact' })
            .order('sort_order', { ascending: true })
            .range(from, to);
        if (error) throw error;
        res.json({
            success: true,
            sponsors: data,
            pagination: { page, limit, total: count }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Fetch error.' });
    }
});

router.post('/sponsors', verifyToken, verifyAdmin, upload.single('logo'), async (req, res) => {
    try {
        const { name, tier, website, sort_order } = req.body;
        if (!name) return res.status(400).json({ success: false, message: 'Sponsor name is required.' });

        let logoUrl = '';
        if (req.file) {
            const fileName = `sponsors/${Date.now()}-${req.file.originalname.replace(/\s+/g, '_')}`;
            const { error: uploadError } = await supabase.storage
                .from('assets')
                .upload(fileName, req.file.buffer, { contentType: req.file.mimetype, upsert: false });
            if (uploadError) throw uploadError;
            const { data: urlData } = supabase.storage.from('assets').getPublicUrl(fileName);
            logoUrl = urlData.publicUrl;
        }

        const { data, error } = await supabase
            .from('sponsors')
            .insert([{ name, logo_url: logoUrl, tier: tier || 'bronze', website: website || '', sort_order: parseInt(sort_order) || 0 }])
            .select()
            .single();
        if (error) throw error;
        res.status(201).json({ success: true, sponsor: data });
    } catch (err) {
        logger.error('SPONSOR ADD ERROR', { message: err.message });
        res.status(500).json({ success: false, message: 'Failed to add sponsor.' });
    }
});

router.put('/sponsors/:id', verifyToken, verifyAdmin, validateIdParam, upload.single('logo'), async (req, res) => {
    try {
        const { name, tier, website, is_active, sort_order } = req.body;
        if (!name) return res.status(400).json({ success: false, message: 'Sponsor name is required.' });

        const updates = { name, tier: tier || 'bronze', website: website || '', sort_order: parseInt(sort_order) || 0 };
        if (is_active !== undefined) updates.is_active = is_active === 'true' || is_active === true;

        if (req.file) {
            // Remove old logo
            const { data: old } = await supabase.from('sponsors').select('logo_url').eq('id', req.params.id).single();
            if (old && old.logo_url) {
                const storagePath = old.logo_url.split('/storage/v1/object/public/assets/')[1];
                if (storagePath) await supabase.storage.from('assets').remove([storagePath]);
            }

            const fileName = `sponsors/${Date.now()}-${req.file.originalname.replace(/\s+/g, '_')}`;
            const { error: uploadError } = await supabase.storage
                .from('assets')
                .upload(fileName, req.file.buffer, { contentType: req.file.mimetype, upsert: false });
            if (uploadError) throw uploadError;
            const { data: urlData } = supabase.storage.from('assets').getPublicUrl(fileName);
            updates.logo_url = urlData.publicUrl;
        }

        const { data, error } = await supabase
            .from('sponsors')
            .update(updates)
            .eq('id', req.params.id)
            .select()
            .single();
        if (error) throw error;
        res.json({ success: true, sponsor: data });
    } catch (err) {
        logger.error('SPONSOR UPDATE ERROR', { message: err.message });
        res.status(500).json({ success: false, message: 'Failed to update sponsor.' });
    }
});

router.delete('/sponsors/:id', verifyToken, verifyAdmin, validateIdParam, async (req, res) => {
    try {
        const { data: sponsor } = await supabase.from('sponsors').select('logo_url').eq('id', req.params.id).single();
        if (sponsor && sponsor.logo_url) {
            const storagePath = sponsor.logo_url.split('/storage/v1/object/public/assets/')[1];
            if (storagePath) await supabase.storage.from('assets').remove([storagePath]);
        }
    const { error } = await supabase.from('sponsors').delete().eq('id', req.params.id);
        if (error) throw error;
        res.json({ success: true, message: 'Sponsor deleted.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Delete error.' });
    }
});

// ═══════════════════════════════════════════════════════════
// HIRING APPLICATIONS
// ═══════════════════════════════════════════════════════════

router.get('/hiring', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data, error, count } = await supabase
            .from('hiring_applications')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(from, to);
        if (error) throw error;
        res.json({
            success: true,
            applications: data,
            pagination: { page, limit, total: count }
        });
    } catch (err) {
        logger.error('ADMIN HIRING ERROR', { message: err.message });
        res.status(500).json({ success: false, message: 'Fetch error.' });
    }
});

router.delete('/hiring/:id', verifyToken, verifyAdmin, validateIdParam, async (req, res) => {
    try {
        const { error } = await supabase
            .from('hiring_applications')
            .delete()
            .eq('id', req.params.id);
        if (error) throw error;
        res.json({ success: true, message: 'Application deleted.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Delete error.' });
    }
});

// ─── POST /api/admin/logout ───
router.post('/logout', (req, res) => {
    res.clearCookie('festiverse_admin_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/'
    });
    res.json({ success: true, message: 'Admin logged out.' });
});

module.exports = router;
