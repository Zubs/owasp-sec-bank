const swaggerAutogen = require('swagger-autogen')();

const doc = {
    info: {
        title: 'Sec-Bank Vulnerable API', description: 'Automatically generated documentation',
    },
    host: 'localhost:1234',
    schemes: ['http'],
    securityDefinitions: {
        bearerAuth: {
            type: 'apiKey',
            name: 'Authorization',
            in: 'header',
            description: 'Enter your bearer token in the format **Bearer &lt;token&gt;**'
        }
    }
};

const outputFile = './swagger.json';
const routes = ['./index.js'];

swaggerAutogen(outputFile, routes, doc);
