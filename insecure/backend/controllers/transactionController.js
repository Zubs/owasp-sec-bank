const pool = require('../config/db');

exports.transferFunds = async (req, res) => {
    const {
        from_account_id,
        to_account_id,
        amount,
        description
    } = req.body;

    try {
        const checkQuery = `
            SELECT balance
            FROM accounts
            WHERE account_id = ${from_account_id}
        `;
        const checkResult = await pool.query(checkQuery);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'Source account not found' });
        }

        const currentBalance = parseFloat(checkResult.rows[0].balance);
        const transferAmount = parseFloat(amount);

        if (currentBalance < transferAmount) {
            return res.status(400).json({ message: 'Insufficient funds' });
        }

        const deductQuery = `
            UPDATE accounts
            SET balance = balance - ${transferAmount}
            WHERE account_id = ${from_account_id}
        `;
        await pool.query(deductQuery);

        const addQuery = `
            UPDATE accounts
            SET balance = balance + ${transferAmount}
            WHERE account_id = ${to_account_id}
        `;
        await pool.query(addQuery);

        const logQuery = `
            INSERT INTO transactions (from_account_id, to_account_id, amount, description)
            VALUES (${from_account_id}, ${to_account_id}, ${transferAmount}, '${description}') RETURNING *
        `;
        const result = await pool.query(logQuery);

        res.status(200).json({
            message: 'Transfer successful',
            transaction: result.rows[0]
        });

    } catch (error) {
        res.status(500).json({ error: error.message, sql_error: error });
    }
};

exports.getHistory = async (req, res) => {
    const accountId = req.params.accountId;

    const query = `
        SELECT *
        FROM transactions
        WHERE from_account_id = ${accountId}
           OR to_account_id = ${accountId}
        ORDER BY timestamp DESC
    `;

    try {
        const result = await pool.query(query);
        res.status(200).json({ transactions: result.rows });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
