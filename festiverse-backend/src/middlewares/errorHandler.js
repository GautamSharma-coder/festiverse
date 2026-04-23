/**
 * Global error handler middleware.
 * Catches all errors (including AppError) and sends consistent JSON responses.
 * Must be registered LAST in the middleware chain.
 */
const logger = require('../config/logger');
const AppError = require('../utils/AppError');

// 404 handler — for routes that don't match
const notFoundHandler = (req, res, next) => {
    next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

// Global error handler
const errorHandler = (err, req, res, _next) => {
    // Default values
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error.';

    // Log all errors
    if (statusCode >= 500) {
        logger.error('Unhandled Error', {
            requestId: req.requestId,
            message: err.message,
            stack: err.stack,
            path: req.originalUrl,
            method: req.method,
        });
    } else {
        logger.warn('Client Error', {
            requestId: req.requestId,
            message: err.message,
            path: req.originalUrl,
            status: statusCode,
        });
    }

    // Never leak stack traces or internal details to the client
    if (!err.isOperational) {
        statusCode = 500;
        message = 'Internal Server Error.';
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(req.requestId && { requestId: req.requestId }),
    });
};

module.exports = { notFoundHandler, errorHandler };
