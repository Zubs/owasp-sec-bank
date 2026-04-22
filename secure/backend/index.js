require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger.json');
const cookieParser = require('cookie-parser');
const path = require('path');
const logger = require('./utils/logger');
const morgan = require('morgan');
const fs = require('fs');

// A02: Require secret from environment — crash early if missing
const COOKIE_SECRET = process.env.COOKIE_SECRET;
if (!COOKIE_SECRET) {
    throw new Error('FATAL: COOKIE_SECRET environment variable is not set.');
}

const authRoutes = require('./routes/authRoutes');
const helloWorldRoutes = require('./routes/helloWorldRoutes');
const accountRoutes = require('./routes/accountRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const app = express();
const PORT = process.env.PORT || 1234;
const uploadDir = path.join(__dirname, '/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

app.use(cors({
    origin: process.env.ALLOWED_ORIGIN || true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(bodyParser.json());
app.use(cookieParser(COOKIE_SECRET));
app.use((req, res, next) => {
    if (req.signedCookies && req.signedCookies.profile_pref) {
        try {
            const str = Buffer.from(req.signedCookies.profile_pref, 'base64').toString();
            req.userPrefs = JSON.parse(str);
        } catch (err) {
            // Invalid cookie — ignore silently
        }
    }

    next();
});

app.use('/uploads', express.static(uploadDir));
app.use(morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) }
}));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));
app.get('/api-docs.json', (req, res) => res.json(swaggerFile));
app.use('/api', helloWorldRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use((
    err,
    req,
    res,
    next
) => {
    logger.error(`Unhandled Exception: ${err.message}`, {
        stack: err.stack,
        path: req.path,
        method: req.method,
        ip: req.ip
    });

    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        error: 'An internal server error occurred. The incident has been logged.'
    });
});

app.listen(PORT, () => {
    console.log(`Secure Server running at http://localhost:${PORT}/api`);
    console.log(`Swagger Docs available at http://localhost:${PORT}/api-docs`);
});
