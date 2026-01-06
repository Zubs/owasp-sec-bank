const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/system-logs', adminController.getSystemLogs);
router.get('/users', adminController.getAllUsers);
router.get('/transactions', adminController.getAllTransactions);

module.exports = router;
