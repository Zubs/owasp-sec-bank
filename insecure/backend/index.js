const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const helloWorldRoutes = require('./routes/helloWorldRoutes');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
const PORT = process.env.PORT || 1234;

app.use(cors());
app.use(bodyParser.json());

// --- Swagger Configuration ---
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'OWASP Sec Bank API',
            version: '1.0.0',
            description: 'A deliberately vulnerable database-driven web application API for educational purposes.',
        },
        servers: [
            { url: `http://localhost:${PORT}` }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    apis: ['./routes/*.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.get('/api-docs.json', (req, res) => res.json(swaggerDocs));
app.use('/api/auth', authRoutes);
app.use('/api/status', helloWorldRoutes);

app.listen(PORT, () => {
    console.log(`Vulnerable Server running on port ${PORT}`);
});
