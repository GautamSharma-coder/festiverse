const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

/**
 * Middleware to verify JWT tokens.
 * Supports both httpOnly cookies and Authorization header (for backward compatibility).
 * Attaches decoded user data to req.user.
 */
const verifyToken = (req, res, next) => {
    // Check for token in httpOnly cookie first (preferred)
    let token = req.cookies?.festiverse_token;

    // Fall back to Authorization header for backward compatibility
    if (!token) {
        const authHeader = req.headers['authorization'];
        if (authHeader) {
            token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
        }
    }

    if (!token) {
        return res.status(403).json({ success: false, message: 'No token provided.' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token.' });
        }
        req.user = decoded;
        next();
    });
};

/**
 * Middleware to verify the user has an admin role.
 * Must be used AFTER verifyToken.
 */
const verifyAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Admin access required.' });
    }
    next();
};

module.exports = { verifyToken, verifyAdmin };
