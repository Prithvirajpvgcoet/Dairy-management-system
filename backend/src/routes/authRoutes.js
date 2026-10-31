const express = require('express');
const rateLimit = require('express-rate-limit');
const { login, signup } = require('../controllers/authController');
const { validate } = require('../middlewares/validateMiddleware');
const { loginSchema, signupSchema } = require('../validations/schemas');
const router = express.Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per windowMs
    message: { message: 'Too many requests from this IP, please try again after 15 minutes' }
});

router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/signup', authLimiter, validate(signupSchema), signup);

module.exports = router;