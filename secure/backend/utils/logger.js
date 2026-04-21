const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const Transport = require('winston-transport');
const pool = require('../config/db');

class PostgresTransport extends Transport {
    constructor(opts) {
        super(opts);
    }

    async log(info, callback) {
        setImmediate(() => this.emit('logged', info));

        try {
            // Extract custom metadata passed to the logger
            const {
                level,
                message,
                event_type,
                user_id,
                ip,
                stack
            } = info;
            const eventType = event_type || level.toUpperCase();
            const description = stack ? `${message} | Stack: ${stack}` : message;

            await pool.query(
                `INSERT INTO system_logs (
                    event_type,
                    user_id,
                    description,
                    ip_address
                ) VALUES (
                    $1,
                    $2,
                    $3,
                    $4
                )`,
                [
                    eventType,
                    user_id || null,
                    description,
                    ip || null
                ]
            );
        } catch (err) {
            console.error('[FATAL] Failed to write log to PostgreSQL:', err.message);
        }

        callback();
    }
}

const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

const logger = winston.createLogger({
    level: 'info',
    format: logFormat,
    defaultMeta: { service: 'sec-bank-api' },
    transports: [
        new DailyRotateFile({
            filename: 'logs/error-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            level: 'error',
            maxSize: '20m', // Rotate if file exceeds 20MB
            maxFiles: '14d' // Automatically delete logs older than 14 days
        }),
        new DailyRotateFile({
            filename: 'logs/security-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '30d'
        }),
        new PostgresTransport()
    ],
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        ),
    }));
}

module.exports = logger;
