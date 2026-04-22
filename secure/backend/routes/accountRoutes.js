const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const verifyToken = require('../middlewares/authMiddleware');
const { validate, lookupAccountSchema } = require('../middlewares/validate');

router.get(
    '/user/:id',
    verifyToken,
    accountController.getAccount
);
router.post(
    '/lookup',
    verifyToken,
    validate(lookupAccountSchema),
    accountController.lookupAccount
);

module.exports = router;
