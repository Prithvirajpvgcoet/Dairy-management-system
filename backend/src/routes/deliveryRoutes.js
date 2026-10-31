const express = require('express');
const { getTodayRoute, markDelivered, collectPayment, getSummary, getMyPerformance } = require('../controllers/deliveryController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const { validate } = require('../middlewares/validateMiddleware');
const { deliveryStatusSchema, collectPaymentSchema } = require('../validations/schemas');
const router = express.Router();

router.use(protect);
router.use(authorize('DELIVERY_BOY'));

router.get('/today-route', getTodayRoute);
router.post('/mark-delivered', validate(deliveryStatusSchema), markDelivered);
router.post('/collect-payment', validate(collectPaymentSchema), collectPayment);
router.get('/summary', getSummary);

router.get('/my-performance', getMyPerformance);

module.exports = router;