/**
 * Wraps async Express route handlers to catch errors automatically.
 * Eliminates repetitive try/catch blocks in every route.
 *
 * Usage:
 *   router.get('/users', asyncHandler(async (req, res) => {
 *       const users = await userService.findAll();
 *       res.json({ success: true, users });
 *   }));
 *
 * Any thrown error (including AppError) is forwarded to the global error handler.
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
