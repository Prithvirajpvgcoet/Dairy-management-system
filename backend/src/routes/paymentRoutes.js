const express = require('express');
const { createOrder, verifyPayment } = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

router.use(protect); // Only authenticated users can access

router.post('/create-order', createOrder);
router.post('/verify-payment', verifyPayment);

module.exports = router;
