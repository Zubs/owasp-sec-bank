const pool = require('../config/db');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const bcrypt = require('bcrypt');

exports.updateProfile = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const {
            username,
            password,
            full_name,
            email,
            role
        } = req.body;
        let fields = [];
        let values = [];
        let paramIndex = 1;

        if (username) {
            fields.push(`username = $${paramIndex++}`);
            values.push(username);
        }

        if (password) {
            fields.push(`password = '${password}'`);
        }

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 12);

            fields.push(`password = $${paramIndex++}`);
            values.push(hashedPassword);
        }

        if (full_name) {
            fields.push(`full_name = $${paramIndex++}`);
            values.push(full_name);
        }

        if (email) {
            fields.push(`email = $${paramIndex++}`);
            values.push(email);
        }

        if (role) {
            fields.push(`role = $${paramIndex++}`);
            values.push(role);
        }

        if (fields.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        const query = `UPDATE users SET ${fields.join(', ')} WHERE user_id = $${paramIndex} RETURNING *`;

        values.push(userId);

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        logger.info(`Profile updated for user ID: ${userId}`, {
            event_type: 'PROFILE_UPDATE_SUCCESS',
            user_id: req.user ? req.user.id : null,
            ip: req.ip
        });

        res.status(200).json({
            message: 'Profile updated successfully',
            user: {
                user_id: result.rows[0].user_id,
                username: result.rows[0].username,
                full_name: result.rows[0].full_name,
                email: result.rows[0].email,
                role: result.rows[0].role
            },
        });
    } catch (error) {
        next(error);
    }
};

exports.getProfile = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const query = `SELECT user_id, username, full_name, email, role FROM users WHERE user_id = $1`;
        const result = await pool.query(query, [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        logger.info(`Profile accessed for user ID: ${userId}`, {
            event_type: 'PROFILE_ACCESS',
            user_id: req.user ? req.user.id : null,
            ip: req.ip
        });

        res.status(200).json({ user: result.rows[0] });
    } catch (error) {
        next(error);
    }
};

exports.uploadAvatar = async (req, res, next) => {
    try {
        const { imageUrl } = req.body;
        const userId = req.user.userId;

        if (!imageUrl) {
            return res.status(400).json({ message: 'Image URL is required' });
        }

        const uploadDir = path.join(__dirname, '../uploads');
        const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer',
            timeout: 5000
        });
        const fileName = `${userId}.png`;
        const filePath = path.join(uploadDir, fileName);

        fs.writeFileSync(filePath, response.data);

        logger.info(`Avatar uploaded/updated for user ID: ${userId}`, {
            event_type: 'AVATAR_UPLOAD_SUCCESS',
            user_id: userId,
            ip: req.ip
        });

        res.status(200).json({
            message: 'Avatar updated successfully',
            url: `/uploads/${fileName}`
        });
    } catch (error) {
        next(error);
    }
};
