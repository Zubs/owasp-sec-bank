const pool = require('../config/db');

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

            res.status(200).json({ message: 'Login successful', user: user });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
