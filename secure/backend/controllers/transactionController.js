const pool = require('../config/db');
const logger = require('../utils/logger');

exports.transferFunds = async (
    req,
    res,
    next
) => {
    try {
        const {
            from_account_id,
            to_account_id,
            amount,
            description
        } = req.body;

        const transferAmount = parseFloat(amount);
        if (isNaN(transferAmount) || transferAmount <= 0) {
            return res.status(400).json({ message: 'Transfer amount must be a positive number' });
        }

        const ownershipQuery = `SELECT account_id
                                FROM accounts
                                WHERE account_id = $1
                                  AND user_id = $2`;
        const ownershipResult = await pool.query(ownershipQuery, [from_account_id, req.user.userId]);

        if (ownershipResult.rows.length === 0) {
            logger.warn(`Unauthorised transfer attempt: account ${from_account_id} does not belong to user ${req.user.userId}`, {
                event_type: 'TRANSFER_FORBIDDEN',
                user_id: req.user.userId,
                ip: req.ip
            });

            return res.status(403).json({ message: 'Forbidden: source account does not belong to you' });
        }

        // Check balance
        const checkQuery = `SELECT balance
                            FROM accounts
                            WHERE account_id = $1`;
        const checkResult = await pool.query(checkQuery, [from_account_id]);
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'Source account not found' });
        }

        const currentBalance = parseFloat(checkResult.rows[0].balance);
        if (currentBalance < transferAmount) {
            logger.warn(`Insufficient funds in account ${from_account_id}`, {
                event_type: 'TRANSFER_FAIL_FUNDS',
                user_id: req.user.userId,
                ip: req.ip
            });

            return res.status(400).json({ message: 'Insufficient funds' });
        }

        await pool.query(`UPDATE accounts
                          SET balance = balance - $1
                          WHERE account_id = $2`, [transferAmount, from_account_id]);
        await pool.query(`UPDATE accounts
                          SET balance = balance + $1
                          WHERE account_id = $2`, [transferAmount, to_account_id]);

        const logQuery = `
            INSERT INTO transactions (
                from_account_id,
                to_account_id,
                amount,
                description
            ) VALUES (
                $1,
                $2,
                $3,
                $4
            ) RETURNING *
        `;

        const result = await pool.query(logQuery, [
            from_account_id,
            to_account_id,
            transferAmount,
            description
        ]);

        logger.info(`Transfer: £${transferAmount} from ${from_account_id} to ${to_account_id}`, {
            event_type: 'TRANSFER_SUCCESS',
            user_id: req.user.userId,
            ip: req.ip
        });

        res.status(200).json({ message: 'Transfer successful', transaction: result.rows[0] });
    } catch (error) {
        next(error);
    }
};

exports.getHistory = async (
    req,
    res,
    next
) => {
    try {
        const accountId = req.params.accountId;

        if (req.user.role !== 'admin') {
            const ownerCheck = await pool.query(
                `SELECT account_id
                 FROM accounts
                 WHERE account_id = $1
                   AND user_id = $2`,
                [accountId, req.user.userId]
            );

            if (ownerCheck.rows.length === 0) {
                return res.status(403).json({ message: 'Forbidden' });
            }
        }

        const query = `
            SELECT *
            FROM transactions
            WHERE from_account_id = $1
               OR to_account_id = $1
            ORDER BY timestamp DESC
        `;
        const result = await pool.query(query, [accountId]);

        logger.info(`Transaction history accessed for account ${accountId}`, {
            event_type: 'TRANSACTION_HISTORY_ACCESS',
            user_id: req.user.userId,
            ip: req.ip
        });

        res.status(200).json({ transactions: result.rows });
    } catch (error) {
        next(error);
    }
};
