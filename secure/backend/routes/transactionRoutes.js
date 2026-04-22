const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const verifyToken = require('../middlewares/authMiddleware');
const { validate, transferSchema } = require('../middlewares/validate');

router.post(
    '/transfer',
    verifyToken,
    validate(transferSchema),
    transactionController.transferFunds
);
router.get(
    '/history/:accountId',
    verifyToken,
    transactionController.getHistory
);

module.exports = router;
