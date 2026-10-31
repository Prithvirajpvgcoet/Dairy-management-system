const express = require('express');
const { getDashboard, updateRequirements, requestQuantityChange, getOrders, getBills, getAccount, checkoutSubscription, checkoutOnetime, getMyWallet, downloadBillPDF, subscribePlan } = require('../controllers/customerController');
const subscriptionController = require('../controllers/subscriptionController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const { validate } = require('../middlewares/validateMiddleware');
const { requirementsSchema, checkoutOnetimeSchema } = require('../validations/schemas');
const router = express.Router();

router.use(protect);
router.use(authorize('CUSTOMER'));

router.get('/dashboard', getDashboard);
router.post('/requirements', validate(requirementsSchema), updateRequirements);
router.post('/change-quantity', requestQuantityChange);
router.post('/checkout-subscription', checkoutSubscription); // No body needed
router.post('/checkout-onetime', validate(checkoutOnetimeSchema), checkoutOnetime);
router.post('/subscribe-plan', subscribePlan);
router.get('/orders', getOrders);
router.get('/bills', getBills);
router.get('/bills/:id/pdf', downloadBillPDF);
router.get('/account', getAccount);
router.get('/wallet', getMyWallet);

// ── Subscription routes ───────────────────────────────────────────────────────
router.get('/subscriptions',          subscriptionController.getMySubscriptions);
router.post('/subscriptions',         subscriptionController.createSubscription);
router.put('/subscriptions/:id',      subscriptionController.updateSubscription);
router.post('/subscriptions/:id/cancel', subscriptionController.cancelSubscription);
router.post('/skip',                  subscriptionController.requestSkip);
router.get('/skips', subscriptionController.getMySkips);
router.delete('/skips/:id', subscriptionController.cancelSkip);
router.post('/addons',                subscriptionController.requestAddon);
router.get('/addons',                 subscriptionController.getMyAddons);

module.exports = router;
