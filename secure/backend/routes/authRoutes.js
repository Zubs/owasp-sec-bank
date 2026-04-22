const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../middlewares/authMiddleware');
const {
    validate,
    registerSchema,
    loginSchema
} = require('../middlewares/validate');

router.post(
    '/register',
    validate(registerSchema),
    authController.register
);
router.post(
    '/login',
    validate(loginSchema),
    authController.login
);
router.post(
    '/logout',
    verifyToken,
    authController.logout
);

module.exports = router;
