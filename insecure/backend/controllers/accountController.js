const pool = require('../config/db');

exports.getAccount = async (req, res) => {
    const userId = req.params.id;

    const query = `SELECT * FROM accounts WHERE user_id = ${userId}`;

    try {
        const result = await pool.query(query);
        if (result.rows.length > 0) {
            res.status(200).json({ account: result.rows[0] });
        } else {
            res.status(404).json({ message: 'Account not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.lookupAccount = async (req, res) => {
    const { account_number } = req.body;

    const query = `
        SELECT u.full_name, a.account_number, a.sort_code, a.account_id
        FROM accounts a
        JOIN users u ON a.user_id = u.user_id
        WHERE a.account_number = '${account_number}'
    `;

    try {
        const result = await pool.query(query);
        if (result.rows.length > 0) {
            res.status(200).json({
                message: 'Account found',
                recipient: result.rows[0]
            });
        } else {
            res.status(404).json({message: 'Account not found'});
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
