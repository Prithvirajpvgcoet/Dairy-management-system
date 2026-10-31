const express = require('express');
const { createOrder, verifyPayment } = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validateMiddleware');
const { verifyPaymentSchema } = require('../validations/schemas');
const router = express.Router();

router.use(protect);

router.post('/create-order', createOrder);
router.post('/verify-payment', validate(verifyPaymentSchema), verifyPayment);

module.exports = router;
