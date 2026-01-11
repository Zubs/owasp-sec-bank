const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middlewares/authMiddleware');

router.put('/:id', verifyToken, userController.updateProfile);
router.get('/:id', verifyToken, userController.getProfile);
router.post('/avatar', verifyToken, userController.uploadAvatar);

module.exports = router;
