const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middlewares/authMiddleware');
const {
    validate, updateProfileSchema,
    lookupAccountSchema,
    avatarSchema
} = require('../middlewares/validate');

router.put(
    '/:id',
    verifyToken,
    validate(updateProfileSchema),
    userController.updateProfile
);
router.get(
    '/:id',
    verifyToken,
    userController.getProfile
);
router.post(
    '/avatar',
    verifyToken,
    validate(avatarSchema),
    userController.uploadAvatar
);

module.exports = router;
