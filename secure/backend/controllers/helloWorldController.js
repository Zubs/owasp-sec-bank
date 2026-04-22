const pool = require('../config/db');
const logger = require('../utils/logger');

exports.getStatus = async (req, res, next) => {
    try {
        await pool.query('SELECT 1');

        logger.info(`System health check accessed`, {
            event_type: 'SYSTEM_HEALTH_CHECK',
            ip: req.ip
        });

        res.status(200).json({
            message: 'Everything is operational',
            db: 'ok',
            timestamp: new Date().toISOString(),
            env: process.env.NODE_ENV,
        });
    } catch (error) {
        next(error);
    }
};
