/**
 * Top-level Route Registrar
 * Mounts versioned API routes and provides backward compatibility.
 */
const v1Routes = require('./v1');

module.exports = (app) => {
    // Current version
    app.use('/api/v1', v1Routes);

    // Backward compatibility: /api/* → /api/v1/*
    // Keeps existing frontend working until migrated to /api/v1/
    app.use('/api', v1Routes);
};
