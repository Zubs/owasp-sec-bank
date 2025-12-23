const pool = require('../config/db');

exports.getStatus = async (req, res) => {
    try {
        // Simple query to validate DB connection
        await pool.query('SELECT 1');

        res.status(200).json({
            message: "Hello World, everything is operational",
            db: "ok",
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            message: "System malfunction",
            db: "unreachable",
            error: error.message
        });
    }
};
