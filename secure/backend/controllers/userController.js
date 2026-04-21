const pool = require('../config/db');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const bcrypt = require('bcrypt');
const { URL } = require('url');

const ALLOWED_IMAGE_CONTENT_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
];

function isSafeUrl(rawUrl) {
    try {
        const parsed = new URL(rawUrl);
        if (parsed.protocol !== 'https:') {
            return false;
        }

        const hostname = parsed.hostname;
        // Block localhost, 127.x, 10.x, 172.16-31.x, 192.168.x, 169.254.x (AWS metadata)
        const blocked = [
            /^localhost$/i,
            /^127\./,
            /^10\./,
            /^172\.(1[6-9]|2\d|3[01])\./,
            /^192\.168\./,
            /^169\.254\./,
            /^::1$/,
            /^0\.0\.0\.0$/,
        ];

        return !blocked.some(r => r.test(hostname));
    } catch {
        return false;
    }
}

exports.updateProfile = async (
    req,
    res,
    next
) => {
    try {
        const requestedId = req.params.id;
        if (req.user.userId !== requestedId && req.user.role !== 'admin') {
            logger.warn(`Unauthorised profile update attempt`, {
                event_type: 'PROFILE_UPDATE_FORBIDDEN',
                user_id: req.user.userId,
                target_id: requestedId,
                ip: req.ip
            });

            return res.status(403).json({ message: 'Forbidden' });
        }

        const {
            username,
            password,
            full_name,
            email
        } = req.body;
        let fields = [];
        let values = [];
        let paramIndex = 1;

        if (username) {
            fields.push(`username = $${paramIndex++}`);
            values.push(username);
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

        if (fields.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        const query = `UPDATE users
                       SET ${fields.join(', ')}
                       WHERE user_id = $${paramIndex} RETURNING *`;

        values.push(requestedId);

        const result = await pool.query(query, values);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        logger.info(`Profile updated for user ID: ${requestedId}`, {
            event_type: 'PROFILE_UPDATE_SUCCESS',
            user_id: req.user.userId,
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

exports.getProfile = async (
    req,
    res,
    next
) => {
    try {
        const requestedId = req.params.id;

        if (req.user.userId !== requestedId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const query = `SELECT user_id, username, full_name, email, role
                       FROM users
                       WHERE user_id = $1`;

        const result = await pool.query(query, [requestedId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        logger.info(`Profile accessed for user ID: ${requestedId}`, {
            event_type: 'PROFILE_ACCESS',
            user_id: req.user.userId,
            ip: req.ip
        });

        res.status(200).json({ user: result.rows[0] });
    } catch (error) {
        next(error);
    }
};

exports.uploadAvatar = async (
    req,
    res,
    next
) => {
    try {
        const { imageUrl } = req.body;
        const userId = req.user.userId;

        if (!imageUrl) {
            return res.status(400).json({message: 'Image URL is required'});
        }

        if (!isSafeUrl(imageUrl)) {
            logger.warn(`SSRF attempt blocked for user ${userId}: ${imageUrl}`, {
                event_type: 'SSRF_BLOCKED',
                user_id: userId,
                ip: req.ip
            });

            return res.status(400).json({message: 'Invalid or disallowed image URL'});
        }

        const https = require('https');
        const response = await new Promise((resolve, reject) => {
            const reqHttp = https.get(imageUrl, { timeout: 5000 }, (res) => {
                const chunks = [];
                const contentType = res.headers['content-type'] || '';

                if (!ALLOWED_IMAGE_CONTENT_TYPES.some(t => contentType.startsWith(t))) {
                    res.destroy();

                    return reject(new Error('URL did not return a valid image content type'));
                }

                let size = 0;
                res.on('data', chunk => {
                    size += chunk.length;
                    if (size > 5 * 1024 * 1024) {
                        res.destroy();
                        return reject(new Error('Image too large'));
                    }

                    chunks.push(chunk);
                });

                res.on('end', () => resolve(Buffer.concat(chunks)));
            });

            reqHttp.on('error', reject);
            reqHttp.on('timeout', () => {
                reqHttp.destroy();
                reject(new Error('Request timed out'));
            });
        });

        const uploadDir = path.join(__dirname, '../uploads');
        const fileName = `${userId}.png`;
        const filePath = path.join(uploadDir, fileName);

        fs.writeFileSync(filePath, response);

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
