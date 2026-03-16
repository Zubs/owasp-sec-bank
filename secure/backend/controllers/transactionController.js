const pool = require('../config/db');
const logger = require('../utils/logger');

exports.transferFunds = async (req, res, next) => {
    try {
        const {
            from_account_id,
            to_account_id,
            amount,
            description
        } = req.body;
        const checkQuery = `
            SELECT balance
            FROM accounts
            WHERE account_id = $1
        `;
        const checkResult = await pool.query(checkQuery, [from_account_id]);

        if (checkResult.rows.length === 0) {
            logger.warn(`Failed transfer attempt: Source account not found (${from_account_id})`, {
                event_type: 'TRANSFER_FAIL_NOT_FOUND',
                user_id: req.user ? req.user.id : null,
                ip: req.ip
            });

            return res.status(404).json({ message: 'Source account not found' });
        }

        const currentBalance = parseFloat(checkResult.rows[0].balance);
        const transferAmount = parseFloat(amount);

        if (currentBalance < transferAmount) {
            logger.warn(`Failed transfer attempt: Insufficient funds in account ${from_account_id}`, {
                event_type: 'TRANSFER_FAIL_FUNDS',
                user_id: req.user ? req.user.id : null,
                ip: req.ip
            });

            return res.status(400).json({ message: 'Insufficient funds' });
        }

        const deductQuery = `
            UPDATE accounts
            SET balance = balance - $1
            WHERE account_id = $2
        `;
        await pool.query(deductQuery, [transferAmount, from_account_id]);

        const addQuery = `
            UPDATE accounts
            SET balance = balance + $1
            WHERE account_id = $2
        `;
        await pool.query(addQuery, [transferAmount, to_account_id]);

        const logQuery = `
            INSERT INTO transactions (from_account_id, to_account_id, amount, description)
            VALUES ($1, $2, $3, $4) RETURNING *
        `;
        const result = await pool.query(logQuery, [from_account_id, to_account_id, transferAmount, description]);

        logger.info(`Transfer executed: ${transferAmount} from ${from_account_id} to ${to_account_id}`, {
            event_type: 'TRANSFER_SUCCESS',
            user_id: req.user ? req.user.id : null,
            ip: req.ip
        });

        res.status(200).json({
            message: 'Transfer successful',
            transaction: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};

exports.getHistory = async (req, res, next) => {
    try {
        const accountId = req.params.accountId;
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
            user_id: req.user ? req.user.id : null,
            ip: req.ip
        });

        res.status(200).json({ transactions: result.rows });
    } catch (error) {
        next(error);
    }
};
