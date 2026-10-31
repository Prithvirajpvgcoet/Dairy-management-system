const express = require('express');
const {
    getDashboard,
    getAuditLogs,
    getDeliveryPerformance,
    addWalletCredit,
    getCustomerWalletHistory,
    downloadAdminBillPDF,
    getQuantityChangeRequests,
    handleQuantityChangeRequest,
    addCustomer,
    assignRoute,
    getDailyLogs,
    generateBills,
    getMonthlyBilling,
    getCustomers,
    getDeliveryBoys,
    addDeliveryBoy,
    getDailyDeliveryReport,
    generateMonthlyBills,
    getCustomerLedger,
    finalizeBill,
    recordBillPayment,
    getBillingOverview,
    getUpcomingExceptions,
    addManualException,
    getTomorrowRoutesSummary,
    addStaff,
    generateDailyDeliveries,
    reorderRoute,
    optimizeRouteByDistance,
    getMessages,
    updateMessageStatus
} = require('../controllers/adminController');
const { getInventory, updateInventory } = require('../controllers/inventoryController');
const { list, create, update, remove } = require('../controllers/productController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const { validate } = require('../middlewares/validateMiddleware');
const { 
    customerSchema, 
    deliveryBoySchema, 
    assignRouteSchema, 
    generateBillsSchema, 
    manualExceptionSchema, 
    staffSchema, 
    productSchema 
} = require('../validations/schemas');

const router = express.Router();

router.use(protect);

router.get('/dashboard', authorize('ADMIN', 'INVENTORY_MNGR', 'BILLING_CLERK', 'SUPPORT'), getDashboard);
router.get('/daily-logs', authorize('ADMIN', 'INVENTORY_MNGR', 'BILLING_CLERK', 'SUPPORT'), getDailyLogs);
router.get('/customers', authorize('ADMIN', 'BILLING_CLERK', 'SUPPORT'), getCustomers);
router.post('/customers', authorize('ADMIN'), validate(customerSchema), addCustomer);
router.get('/delivery-boys', authorize('ADMIN'), getDeliveryBoys);
router.post('/delivery-boys', authorize('ADMIN'), validate(deliveryBoySchema), addDeliveryBoy);
router.post('/staff', authorize('ADMIN'), validate(staffSchema), addStaff);
router.post('/assign-route', authorize('ADMIN'), validate(assignRouteSchema), assignRoute);
router.put('/reorder-route', authorize('ADMIN'), reorderRoute);
router.post('/optimize-route', authorize('ADMIN'), optimizeRouteByDistance);
router.post('/deliveries/generate', authorize('ADMIN'), generateDailyDeliveries);

// Billing
router.get('/billing/overview', authorize('ADMIN', 'BILLING_CLERK'), getBillingOverview);
router.get('/billing/daily-report', authorize('ADMIN', 'BILLING_CLERK'), getDailyDeliveryReport);
router.get('/billing/ledger/:id', authorize('ADMIN', 'BILLING_CLERK'), getCustomerLedger);
router.post('/billing/generate', authorize('ADMIN', 'BILLING_CLERK'), generateMonthlyBills);
router.post('/billing/finalize/:bill_id', authorize('ADMIN', 'BILLING_CLERK'), finalizeBill);
router.post('/bills/:id/pay', authorize('ADMIN', 'BILLING_CLERK'), recordBillPayment);
router.get('/bills/:id/pdf', authorize('ADMIN', 'BILLING_CLERK'), downloadAdminBillPDF);
router.post('/generate-bill', authorize('ADMIN', 'BILLING_CLERK'), validate(generateBillsSchema), generateBills);
router.get('/monthly-billing', authorize('ADMIN', 'BILLING_CLERK'), getMonthlyBilling);

// Exceptions
router.get('/exceptions/upcoming', authorize('ADMIN', 'SUPPORT'), getUpcomingExceptions);
router.post('/exceptions/manual', authorize('ADMIN', 'SUPPORT'), validate(manualExceptionSchema), addManualException);
router.get('/exceptions/tomorrow-routes', authorize('ADMIN', 'SUPPORT'), getTomorrowRoutesSummary);

// Performance & Audit
router.get('/performance', authorize('ADMIN'), getDeliveryPerformance);
router.get('/audit-logs', authorize('ADMIN'), getAuditLogs);

// Products
router.get('/products', authorize('ADMIN', 'INVENTORY_MNGR'), list);
router.post('/products', authorize('ADMIN', 'INVENTORY_MNGR'), validate(productSchema), create);
router.put('/products/:id', authorize('ADMIN', 'INVENTORY_MNGR'), validate(productSchema), update);
router.delete('/products/:id', authorize('ADMIN', 'INVENTORY_MNGR'), remove);

// Inventory
router.get('/inventory', authorize('ADMIN', 'INVENTORY_MNGR'), getInventory);
router.post('/inventory', authorize('ADMIN', 'INVENTORY_MNGR'), updateInventory);

// Quantity Change Requests
router.get('/quantity-change-requests', authorize('ADMIN', 'SUPPORT'), getQuantityChangeRequests);
router.put('/quantity-change-requests/:id', authorize('ADMIN', 'SUPPORT'), handleQuantityChangeRequest);

// Wallet
router.post('/wallet/credit', authorize('ADMIN', 'BILLING_CLERK'), addWalletCredit);
router.get('/wallet/:customer_id', authorize('ADMIN', 'BILLING_CLERK'), getCustomerWalletHistory);

// Support Messages & Inquiries
router.get('/messages', authorize('ADMIN', 'SUPPORT'), getMessages);
router.put('/messages/:id/status', authorize('ADMIN', 'SUPPORT'), updateMessageStatus);

module.exports = router;
