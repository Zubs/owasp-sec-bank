require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger.json'); // Import the auto-generated JSON
const serialize = require('node-serialize');
const cookieParser = require('cookie-parser');
const path = require('path');
const logger = require('./utils/logger');
const morgan = require('morgan');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const helloWorldRoutes = require('./routes/helloWorldRoutes');
const accountRoutes = require('./routes/accountRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 1234;
const uploadDir = path.join(__dirname, '/uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use((req, res, next) => {
    if (req.cookies.profile_pref) {
        try {
            const str = Buffer.from(req.cookies.profile_pref, 'base64').toString();
            const obj = serialize.unserialize(str);

            req.userPrefs = obj;
        } catch (err) {
            console.error("Deserialization error:", err.message);
        }
    }

    next();
});
app.use('/uploads', express.static(uploadDir));
app.use(morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) }
}));

// --- Swagger Documentation ---
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));
app.get('/api-docs.json', (req, res) => res.json(swaggerFile));

// --- API Routes ---
app.use('/api', helloWorldRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

app.use((err, req, res, next) => {
    // 1. Log the full error and stack trace INTERNALLY
    logger.error(`Unhandled Exception: ${err.message}`, {
        stack: err.stack,
        path: req.path,
        method: req.method,
        ip: req.ip
    });

    // 2. Return a generic, safe error message to the FRONTEND
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        error: 'An internal server error occurred. The incident has been logged.'
    });
});

app.listen(PORT, () => {
    console.log(`Vulnerable Server running at http://localhost:${PORT}/api`);
    console.log(`Swagger Docs available at http://localhost:${PORT}/api-docs`);
});
