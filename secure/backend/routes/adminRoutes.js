const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const verifyToken = require('../middlewares/authMiddleware');

router.get(
    '/system-logs',
    verifyToken,
    adminController.requireAdmin,
    adminController.getSystemLogs
);
router.get(
    '/users',
    verifyToken,
    adminController.requireAdmin,
    adminController.getAllUsers
);
router.get(
    '/transactions',
    verifyToken,
    adminController.requireAdmin,
    adminController.getAllTransactions
);

module.exports = router;
