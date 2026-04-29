/**
 * Festiverse Backend — Server Entry Point
 *
 * This file only handles:
 * 1. DNS fix for ISP hijacking
 * 2. Environment validation
 * 3. App creation via factory
 * 4. Server startup
 *
 * All middleware, routes, and config live in src/
 */

// Fix DNS resolution issues and IPv6 timeouts for native fetch
require('dns').setDefaultResultOrder('ipv4first');

// Validate environment before anything else
const { validateEnv, config } = require('./src/config/env');
validateEnv();

// Create and start the app
const createApp = require('./src/app');
const logger = require('./src/config/logger');

const app = createApp();

app.listen(config.port, () => {
    logger.info(`🚀 Festiverse Backend v1 running on http://localhost:${config.port}`);
    logger.info(`📡 API available at /api/v1`);
});

module.exports = app;