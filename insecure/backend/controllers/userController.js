const pool = require('../config/db');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

exports.updateProfile = async (req, res) => {
    const userId = req.params.id;
    const {
        username,
        password,
        full_name,
        email,
        role
    } = req.body;

    let fields = [];
    if (username) {
        fields.push(`username = '${username}'`);
    }

    if (password) {
        fields.push(`password = '${password}'`);
    }

    if (full_name) {
        fields.push(`full_name = '${full_name}'`);
    }

    if (email) {
        fields.push(`email = '${email}'`);
    }

    if (role) {
        fields.push(`role = '${role}'`);
    }

    if (fields.length === 0) {
        return res.status(400).json({ message: 'No fields to update' });
    }

    const query = `UPDATE users SET ${fields.join(', ')} WHERE user_id = ${userId} RETURNING *`;

    try {
        const result = await pool.query(query);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'Profile updated successfully',
            user: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getProfile = async (req, res) => {
    const userId = req.params.id;

    try {
        const result = await pool.query(`SELECT user_id, username, full_name, email, role FROM users WHERE user_id = ${userId}`);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ user: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.uploadAvatar = async (req, res) => {
    const { imageUrl } = req.body;
    const userId = req.user.userId;

    if (!imageUrl) {
        return res.status(400).json({ message: 'Image URL is required' });
    }

    try {
        const uploadDir = path.join(__dirname, '../uploads');

        const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer',
            timeout: 5000
        });

        const fileName = `${userId}.png`;
        const filePath = path.join(uploadDir, fileName);

        fs.writeFileSync(filePath, response.data);

        res.status(200).json({
            message: 'Avatar updated successfully',
            url: `/uploads/${fileName}`
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch image', details: error.message });
    }
};
