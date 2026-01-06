const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

router.post('/transfer', transactionController.transferFunds);

router.get('/history/:accountId', transactionController.getHistory);

module.exports = router;
