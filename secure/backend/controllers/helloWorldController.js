const pool = require('../config/db');
const logger = require('../utils/logger');

exports.getStatus = async (req, res, next) => {
    try {
        // Simple query to validate DB connection
        await pool.query('SELECT 1');

        logger.info(`System health check accessed`, {
            event_type: 'SYSTEM_HEALTH_CHECK',
            ip: req.ip
        });

        res.status(200).json({
            message: "Hello World, everything is operational",
            db: "ok",
            env: process.env.NODE_ENV,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        next(error);
    }
};
