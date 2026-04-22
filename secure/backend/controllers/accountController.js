const pool = require('../config/db');
const logger = require('../utils/logger');

exports.getAccount = async (
    req,
    res,
    next
) => {
    try {
        const requestedUserId = req.params.id;

        if (req.user.userId !== requestedUserId && req.user.role !== 'admin') {
            logger.warn(`Unauthorised account access attempt`, {
                event_type: 'ACCOUNT_ACCESS_FORBIDDEN',
                user_id: req.user.userId,
                target_id: requestedUserId,
                ip: req.ip
            });

            return res.status(403).json({ message: 'Forbidden' });
        }

        const query = `SELECT *
                       FROM accounts
                       WHERE user_id = $1`;

        const result = await pool.query(query, [requestedUserId]);

        if (result.rows.length > 0) {
            res.status(200).json({ account: result.rows[0] });
        } else {
            res.status(404).json({ message: 'Account not found' });
        }
    } catch (error) {
        next(error);
    }
};

exports.lookupAccount = async (
    req,
    res,
    next
) => {
    try {
        const { account_number } = req.body;
        const query = `
            SELECT u.full_name, a.account_number, a.sort_code, a.account_id
            FROM accounts a
                     JOIN users u ON a.user_id = u.user_id
            WHERE a.account_number = $1
        `;

        const result = await pool.query(query, [account_number]);

        if (result.rows.length > 0) {
            const recipient = result.rows[0];
            logger.info(`Account lookup successful`, {
                event_type: 'ACCOUNT_LOOKUP_SUCCESS',
                ip: req.ip,
                user_id: req.user ? req.user.userId : null
            });

            res.status(200).json({ message: 'Account found', recipient });
        } else {
            logger.warn(`Failed account lookup for account: ${account_number}`, {
                event_type: 'ACCOUNT_LOOKUP_FAIL',
                ip: req.ip,
                user_id: req.user ? req.user.userId : null
            });

            res.status(404).json({ message: 'Account not found' });
        }
    } catch (error) {
        next(error);
    }
};
