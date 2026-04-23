/**
 * API v1 Route Registrar
 * Mounts all v1 API routes on a single Express router.
 * Refactored routes use new Controller → Service pattern.
 * Legacy routes reference existing files (will be migrated incrementally).
 */
const router = require('express').Router();

// ─── Refactored Routes (Controller → Service) ───
router.use('/auth', require('./authRoutes'));
router.use('/payment', require('./paymentRoutes'));

// ─── Legacy Routes (unchanged, will be refactored later) ───
router.use('/events', require('../eventRoutes'));
router.use('/admin', require('../adminRoutes'));
router.use('/gallery', require('../galleryRoutes'));
router.use('/contact', require('../contactRoutes'));
router.use('/team', require('../teamRoutes'));
router.use('/faculty', require('../facultyRoutes'));
router.use('/notices', require('../noticeRoutes'));
router.use('/proxy', require('../proxyRoutes'));
router.use('/results', require('../resultRoutes'));
router.use('/sponsors', require('../sponsorRoutes'));
router.use('/hiring', require('../hiringRoutes'));
router.use('/certificates', require('../certificateRoutes'));
router.use('/analytics', require('../analyticsRoutes'));

module.exports = router;
