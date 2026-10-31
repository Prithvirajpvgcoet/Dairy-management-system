const express = require('express');
const rateLimit = require('express-rate-limit');
const { login, signup } = require('../controllers/authController');
const { validate } = require('../middlewares/validateMiddleware');
const { loginSchema, signupSchema } = require('../validations/schemas');
const router = express.Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Limit each IP to 50 failed attempts per windowMs
    skipSuccessfulRequests: true,
    message: { message: 'Too many failed login attempts, please try again after 15 minutes' }
});

router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/signup', authLimiter, validate(signupSchema), signup);

module.exports = router;
