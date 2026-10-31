const express = require('express');
const rateLimit = require('express-rate-limit');
const { login, signup, getMe, changePassword } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
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
router.get('/me', protect, getMe);
router.post('/change-password', protect, changePassword);

module.exports = router;
