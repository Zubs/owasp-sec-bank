const pool = require('../config/db');

exports.getSystemLogs = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM system_logs ORDER BY timestamp DESC LIMIT 100');
        res.status(200).json({ logs: result.rows });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users ORDER BY user_id ASC');
        res.status(200).json({ users: result.rows });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllTransactions = async (req, res) => {
    try {
        const query = `
            SELECT t.transaction_id, t.amount, t.description, t.timestamp,
                   u_from.username as sender, u_to.username as recipient
            FROM transactions t
            LEFT JOIN accounts a_from ON t.from_account_id = a_from.account_id
            LEFT JOIN users u_from ON a_from.user_id = u_from.user_id
            LEFT JOIN accounts a_to ON t.to_account_id = a_to.account_id
            LEFT JOIN users u_to ON a_to.user_id = u_to.user_id
            ORDER BY t.timestamp DESC
        `;

        const result = await pool.query(query);
        res.status(200).json({ transactions: result.rows });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
