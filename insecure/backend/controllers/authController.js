const pool = require('../config/db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'super_secret_key_123';

const generateAccountNumber = () => {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
}

const generateSortCode = () => {
    return '12-34-56';
}

exports.register = async (req, res) => {
    const {
        username,
        password,
        full_name,
        email
    } = req.body;

    try {
        const query = `
            INSERT INTO users (username, password, full_name, email)
            VALUES ('${username}', '${password}', '${full_name}', '${email}') RETURNING *;
        `;

        const userResult = await pool.query(query);
        const user = userResult.rows[0];
        let accountCreated = false;
        let account = null;
        let attempts = 0;

        while (!accountCreated && attempts < 5) {
            try {
                const accNum = generateAccountNumber();
                const sortCode = generateSortCode();
                const accountQuery = `
                    INSERT INTO accounts (user_id, account_number, sort_code, account_type, balance)
                    VALUES (${user.user_id}, '${accNum}', '${sortCode}', 'Current', 100.00) RETURNING *;
                `;

                const accountResult = await pool.query(accountQuery);
                account = accountResult.rows[0];
                accountCreated = true;
            } catch (err) {
                // Postgres error 23505 = Unique Violation. If so, retry.
                if (err.code === '23505') {
                    attempts++;
                    console.log("Account number collision, retrying...");
                } else {
                    throw err;
                }
            }
        }

        if (!accountCreated) {
            throw new Error("Failed to generate a unique account number after 5 attempts");
        }

        const token = jwt.sign(
            { userId: user.user_id, role: user.role },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        await pool.query(`INSERT INTO tokens (user_id, token) VALUES (${user.user_id}, '${token}')`);

        res.status(201).json({
            message: 'User registered',
            user,
            token,
            account
        });
    } catch (error) {
        res.status(500).json({ error: error.message, detail: error });
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;

    const query = `
        SELECT *
        FROM users
        WHERE username = '${username}'
          AND password = '${password}'
    `;

    try {
        const result = await pool.query(query);

        if (result.rows.length > 0) {
            const user = result.rows[0];

            const token = jwt.sign(
                { userId: user.user_id, role: user.role },
                JWT_SECRET,
                { expiresIn: '30d' }
            );

            await pool.query(`INSERT INTO tokens (user_id, token) VALUES (${user.user_id}, '${token}')`);

            res.status(200).json({
                message: 'Login successful',
                user,
                token,
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.logout = async (req, res) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(400).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const query = `DELETE FROM tokens WHERE token = '${token}'`;
        await pool.query(query);

        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
