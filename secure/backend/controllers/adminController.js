const pool = require('../config/db');
const logger = require('../utils/logger');

exports.requireAdmin = (
    req,
    res,
    next
) => {
    if (!req.user || req.user.role !== 'admin') {
        logger.warn(`Non-admin tried to access admin route`, {
            event_type: 'ADMIN_ACCESS_FORBIDDEN',
            user_id: req.user ? req.user.userId : null,
            ip: req.ip
        });

        return res.status(403).json({ message: 'Forbidden: admin access required' });
    }

    next();
};

exports.getSystemLogs = async (
    req,
    res,
    next
) => {
    try {
        const result = await pool.query('SELECT * FROM system_logs ORDER BY timestamp DESC LIMIT 100');

        logger.info(`Admin accessed system logs`, {
            event_type: 'ADMIN_ACCESS_LOGS',
            ip: req.ip,
            user_id: req.user.userId
        });

        res.status(200).json({ logs: result.rows });
    } catch (error) {
        next(error);
    }
};

exports.getAllUsers = async (
    req,
    res,
    next
) => {
    try {
        const result = await pool.query(
            'SELECT user_id, username, full_name, email, role, created_at FROM users ORDER BY user_id ASC'
        );

        logger.info(`Admin accessed the global users list`, {
            event_type: 'ADMIN_ACCESS_USERS',
            ip: req.ip,
            user_id: req.user.userId
        });

        res.status(200).json({ users: result.rows });
    } catch (error) {
        next(error);
    }
};

exports.getAllTransactions = async (req, res, next) => {
    try {
        const query = `
            SELECT t.transaction_id,
                   t.amount,
                   t.description,
                   t.timestamp,
                   u_from.username as sender,
                   u_to.username   as recipient
            FROM transactions t
                     LEFT JOIN accounts a_from ON t.from_account_id = a_from.account_id
                     LEFT JOIN users u_from ON a_from.user_id = u_from.user_id
                     LEFT JOIN accounts a_to ON t.to_account_id = a_to.account_id
                     LEFT JOIN users u_to ON a_to.user_id = u_to.user_id
            ORDER BY t.timestamp DESC
        `;
        const result = await pool.query(query);

        logger.info(`Admin accessed the global transactions list`, {
            event_type: 'ADMIN_ACCESS_TRANSACTIONS',
            ip: req.ip,
            user_id: req.user.userId
        });

        res.status(200).json({ transactions: result.rows });
    } catch (error) {
        next(error);
    }
};
