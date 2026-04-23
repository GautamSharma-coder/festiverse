/**
 * HTTP request/response logging middleware.
 * Logs method, path, status code, and response time.
 */
const logger = require('../config/logger');

const requestLogger = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
            method: req.method,
            path: req.originalUrl || req.path,
            status: res.statusCode,
            duration: `${duration}ms`,
        };
        if (res.statusCode >= 400) {
            logger.warn('HTTP Request', logData);
        } else {
            logger.info('HTTP Request', logData);
        }
    });
    next();
};

module.exports = requestLogger;
