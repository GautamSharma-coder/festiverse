/**
 * Custom operational error class for the Festiverse API.
 * Use this for expected errors (bad input, not found, unauthorized, etc.)
 * These are caught by the global error handler and returned as JSON responses.
 *
 * Usage:
 *   throw new AppError('User not found.', 404);
 *   throw new AppError('Invalid payment signature.', 400);
 */
class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true; // Distinguishes from programming errors
        Error.captureStackTrace(this, this.constructor);
    }

    // Factory methods for common errors
    static badRequest(message = 'Bad request.') {
        return new AppError(message, 400);
    }

    static unauthorized(message = 'Unauthorized.') {
        return new AppError(message, 401);
    }

    static forbidden(message = 'Forbidden.') {
        return new AppError(message, 403);
    }

    static notFound(message = 'Resource not found.') {
        return new AppError(message, 404);
    }

    static conflict(message = 'Resource already exists.') {
        return new AppError(message, 409);
    }

    static tooMany(message = 'Too many requests.') {
        return new AppError(message, 429);
    }

    static internal(message = 'Internal server error.') {
        return new AppError(message, 500);
    }

    static serviceUnavailable(message = 'Service temporarily unavailable.') {
        return new AppError(message, 503);
    }
}

module.exports = AppError;
