const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_123';

module.exports = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Malformed token' });
    }

    try {
        const query = `SELECT * FROM tokens WHERE token = '${token}'`;
        const result = await pool.query(query);

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Session expired or logged out' });
        }

        jwt.verify(token, JWT_SECRET, async (err, decoded) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    try {
                        await pool.query(`DELETE FROM tokens WHERE token = '${token}'`);
                        return res.status(401).json({ message: 'Token expired' });
                    } catch (dbError) {
                        return res.status(500).json({ error: dbError.message });
                    }
                }

                return res.status(403).json({ message: 'Invalid token' });
            }

            req.user = decoded;
            next();
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};
