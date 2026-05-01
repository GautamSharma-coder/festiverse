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

// Fix ISP DNS hijacking — force IP resolution for native fetch
const undici = require('undici');
const agent = new undici.Agent({
    connect: {
        lookup: (hostname, options, callback) => {
            if (hostname.includes('supabase.co')) {
                return callback(null, [{ address: process.env.SUPABASE_FIXED_IP || '104.18.38.10', family: 4 }]);
            }
            require('dns').lookup(hostname, options, callback);
        }
    }
});
undici.setGlobalDispatcher(agent);

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