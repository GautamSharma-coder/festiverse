/**
 * CSRF defense-in-depth middleware.
 * Validates that state-changing requests (POST, PUT, DELETE, PATCH)
 * include the X-Requested-With header. This header cannot be set
 * by cross-origin HTML forms (only by XMLHttpRequest/fetch), providing
 * a simple CSRF mitigation layer alongside SameSite cookies.
 */
function csrfGuard(req, res, next) {
    const mutatingMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];

    // Only enforce on state-changing methods
    if (!mutatingMethods.includes(req.method)) {
        return next();
    }

    // Skip for webhook endpoints that use signature verification instead
    if (req.path.includes('/webhook')) {
        return next();
    }

    // Skip for heartbeat endpoints (lightweight, no auth required)
    if (req.path.includes('/heartbeat')) {
        return next();
    }

    const xRequestedWith = req.headers['x-requested-with'];
    if (xRequestedWith !== 'XMLHttpRequest') {
        return res.status(403).json({
            success: false,
            message: 'Forbidden: missing required X-Requested-With header.',
        });
    }

    next();
}

module.exports = csrfGuard;
