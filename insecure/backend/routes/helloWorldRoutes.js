const express = require('express');
const router = express.Router();
const helloWorldController = require('../controllers/helloWorldController');

/**
 * @openapi
 * /api/status:
 *   get:
 *     summary: Check API health
 *     description: Returns the operational status of the API and database connection.
 *     responses:
 *       200:
 *         description: System is operational
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Hello World, everything is operational"
 *                 db:
 *                   type: string
 *                   example: "ok"
 */
router.get('/', helloWorldController.getStatus);

module.exports = router;
