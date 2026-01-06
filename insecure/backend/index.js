require('dotenv').config(); // Load environment variables at the top
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger-output.json'); // Import the auto-generated JSON

// Import Routes
const authRoutes = require('./routes/authRoutes');
const helloWorldRoutes = require('./routes/helloWorldRoutes');
const accountRoutes = require('./routes/accountRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 1234;

app.use(cors());
app.use(bodyParser.json());

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

app.listen(PORT, () => {
    console.log(`Vulnerable Server running at http://localhost:${PORT}/api`);
    console.log(`Swagger Docs available at http://localhost:${PORT}/api-docs`);
});
