const express = require('express');
const rateLimit = require('express-rate-limit');
const { getProducts, getPlans, getFaqs, submitContact, trackOrder } = require('../controllers/publicController');

const router = express.Router();

// General public rate limiter
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false
});

// Dedicated strict limiter for contact messages to prevent spam
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Max 20 submissions per IP per hour
  message: { message: 'Too many requests. Please try again after an hour.' }
});

router.use(publicLimiter);

router.get('/products', getProducts);
router.get('/plans', getPlans);
router.get('/faqs', getFaqs);
router.post('/contact', contactLimiter, submitContact);
router.get('/track-order/:query', trackOrder);

module.exports = router;
