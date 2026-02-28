const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const verifyToken = require('../middlewares/authMiddleware');

router.get('/user/:id', verifyToken, accountController.getAccount);
router.post('/lookup', verifyToken, accountController.lookupAccount);

module.exports = router;
