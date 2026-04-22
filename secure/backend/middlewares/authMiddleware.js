const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('FATAL: JWT_SECRET environment variable is not set.');
}

module.exports = async (
    req,
    res,
    next
) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Malformed token' });
    }

    try {
        const query = `SELECT *
                       FROM tokens
                       WHERE token = $1`;

        const result = await pool.query(query, [token]);
        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Session expired or logged out' });
        }

        jwt.verify(token, JWT_SECRET, async (err, decoded) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    try {
                        await pool.query(`DELETE
                                          FROM tokens
                                          WHERE token = $1`, [token]);
                        return res.status(401).json({ message: 'Token expired' });
                    } catch (dbError) {
                        return next(dbError);
                    }
                }

                return res.status(403).json({ message: 'Invalid token' });
            }

            req.user = decoded;

            next();
        });
    } catch (error) {
        next(error);
    }
};
