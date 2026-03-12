const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const serialize = require('node-serialize');
const logger = require('../utils/logger');
const bcrypt = require('bcrypt');

const JWT_SECRET = 'super_secret_key_123';

const generateAccountNumber = () => {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
}

const generateSortCode = () => {
    return '12-34-56';
}

const createToken = async (userId, role) => {
    const token = jwt.sign(
        { userId, role },
        JWT_SECRET,
        { expiresIn: '30d' }
    );

    await pool.query(`INSERT INTO tokens (user_id, token) VALUES ($1, $2)`, [userId, token]);

    return token;
}

exports.register = async (req, res) => {
    const {
        username,
        password,
        full_name,
        email
    } = req.body;

    try {
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const query = `
            INSERT INTO users (username, password, full_name, email)
            VALUES ($1, $2, $3, $4) RETURNING *;
        `;
        const userResult = await pool.query(query, [username, hashedPassword, full_name, email]);
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
                    VALUES ($1, $2, $3, 'Current', 100.00) RETURNING *;
                `;
                const accountResult = await pool.query(accountQuery, [user.user_id, accNum, sortCode]);
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
            return res.status(500).json({error: 'Failed to generate unique account number'});
        }

        const token = await createToken(user.user_id, user.role);
        const preferences = { theme: 'light', language: 'en', notifications: true };
        const serializedPref = serialize.serialize(preferences);
        const base64Pref = Buffer.from(serializedPref).toString('base64');

        logger.info(`New user registered: ${username} (ID: ${user.user_id})`);

        res.cookie('profile_pref', base64Pref, { maxAge: 900000, httpOnly: false });
        res.status(201).json({
            message: 'User registered',
            user: {
                user_id: user.user_id,
                username: user.username,
                full_name: user.full_name,
                email: user.email,
                role: user.role
            },
            token,
            account
        });
    } catch (error) {
        logger.error(`Registration failed: ${error.message}`);

        if (error.code === '23505') {
            return res.status(400).json({error: 'Username or email already exists'});
        }

        res.status(500).json({error: 'Internal server error during registration'});
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const query = `SELECT * FROM users WHERE username = $1`;
        const result = await pool.query(query, [username]);

        if (result.rows.length > 0) {
            const user = result.rows[0];

            if (!user) {
                logger.warn(`Failed login attempt (user not found): ${username}`, { ip: req.ip });

                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                logger.warn(`Failed login attempt (wrong password): ${username}`, { ip: req.ip });

                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const token = await createToken(user.user_id, user.role);
            const preferences = { theme: 'light', language: 'en', notifications: true };
            const serializedPref = serialize.serialize(preferences);
            const base64Pref = Buffer.from(serializedPref).toString('base64');

            logger.info(`Successful login for user ID: ${user.user_id}`, { ip: req.ip, username: username });

            res.cookie('profile_pref', base64Pref, { maxAge: 900000, httpOnly: false });
            res.status(200).json({
                message: 'Login successful',
                user: {
                    user_id: user.user_id,
                    username: user.username,
                    full_name: user.full_name,
                    email: user.email,
                    role: user.role
                },
                token,
            });
        } else {
            logger.warn(`Failed login attempt for username: ${username}`, {ip: req.ip});

            res.status(401).json({message: 'Invalid credentials'});
        }
    } catch (error) {
        logger.error(`Login error: ${error.message}`);

        res.status(500).json({ error: 'Internal server error during login' });
    }
};

exports.logout = async (req, res) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(400).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const query = `DELETE FROM tokens WHERE token = $1`;

        await pool.query(query, [token]);

        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        logger.error(`Logout error: ${error.message}`);

        res.status(500).json({ error: 'Internal server error during logout' });
    }
};
