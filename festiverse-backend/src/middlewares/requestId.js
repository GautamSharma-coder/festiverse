/**
 * Attaches a unique request ID to every incoming request.
 * Used for debugging and correlating logs without leaking internals.
 */
const crypto = require('crypto');

const requestId = (req, res, next) => {
    req.requestId = crypto.randomUUID();
    res.setHeader('X-Request-ID', req.requestId);
    next();
};

module.exports = requestId;
