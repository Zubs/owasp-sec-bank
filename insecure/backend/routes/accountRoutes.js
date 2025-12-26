const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');

router.get('/user/:id', accountController.getAccount);
router.post('/lookup', accountController.lookupAccount);

module.exports = router;
