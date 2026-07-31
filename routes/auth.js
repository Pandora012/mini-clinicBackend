const express = require('express');
const router = express.Router();
const { login, register, getProfile } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const { loginValidation, registerValidation } = require('../validations/authValidation');
const validate = require('../middleware/validation');

router.post('/login', loginValidation, validate, login);
router.post('/register', registerValidation, validate, register);
router.get('/profile', authMiddleware, getProfile);

module.exports = router;