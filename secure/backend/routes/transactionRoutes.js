const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const verifyToken = require('../middlewares/authMiddleware');

router.post('/transfer', verifyToken, transactionController.transferFunds);
router.get('/history/:accountId', verifyToken, transactionController.getHistory);

module.exports = router;
