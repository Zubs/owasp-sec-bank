const pool = require('../config/db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'super_secret_key_123';

exports.register = async (req, res) => {
    const {
        username,
        password,
        full_name,
        email
    } = req.body;

    const query = `
        INSERT INTO users (username, password, full_name, email)
        VALUES ('${username}', '${password}', '${full_name}', '${email}') RETURNING *;
    `;

    try {
        const result = await pool.query(query);
        res.status(201).json({ message: 'User registered', user: result.rows[0] });
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

            const tokenQuery = `INSERT INTO tokens (user_id, token) VALUES (${user.user_id}, '${token}')`;
            await pool.query(tokenQuery);

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
