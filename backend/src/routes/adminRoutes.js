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
    optimizeRouteByDistance
} = require('../controllers/adminController');
const { list, create, update, remove } = require('../controllers/productController');
const { getInventory, updateInventory } = require('../controllers/inventoryController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const { validate } = require('../middlewares/validateMiddleware');
const { customerSchema, deliveryBoySchema, assignRouteSchema, productSchema, recordPaymentSchema } = require('../validations/schemas');
const router = express.Router();

// All admin routes require auth
router.use(protect);

// Dashboard & Analytics
router.get('/dashboard', authorize('ADMIN', 'INVENTORY_MNGR', 'BILLING_CLERK', 'SUPPORT'), getDashboard);
router.get('/audit-logs', authorize('ADMIN'), getAuditLogs);
router.get('/performance', authorize('ADMIN', 'SUPPORT'), getDeliveryPerformance);

// Customers
router.post('/customers', authorize('ADMIN', 'SUPPORT'), validate(customerSchema), addCustomer);
router.get('/customers', authorize('ADMIN', 'SUPPORT'), getCustomers);

// Delivery Boys
router.get('/delivery-boys', authorize('ADMIN', 'SUPPORT'), getDeliveryBoys);
router.post('/delivery-boys', authorize('ADMIN', 'SUPPORT'), validate(deliveryBoySchema), addDeliveryBoy);
router.post('/staff', authorize('ADMIN'), addStaff);

// Routes
router.post('/assign-route', authorize('ADMIN', 'SUPPORT'), validate(assignRouteSchema), assignRoute);
router.post('/routes/reorder', authorize('ADMIN', 'SUPPORT'), reorderRoute);
router.post('/routes/optimize', authorize('ADMIN', 'SUPPORT'), optimizeRouteByDistance);
router.post('/deliveries/generate', authorize('ADMIN', 'SUPPORT'), generateDailyDeliveries);
router.get('/daily-logs', authorize('ADMIN', 'SUPPORT', 'BILLING_CLERK', 'INVENTORY_MNGR'), getDailyLogs);
router.post('/generate-bills', authorize('ADMIN', 'BILLING_CLERK'), generateBills);
router.get('/monthly-billing', authorize('ADMIN', 'BILLING_CLERK'), getMonthlyBilling);

// Exceptions
router.get('/exceptions/upcoming', authorize('ADMIN', 'SUPPORT'), getUpcomingExceptions);
router.post('/exceptions/add', authorize('ADMIN', 'SUPPORT'), addManualException);
router.get('/exceptions/tomorrow-routes', authorize('ADMIN', 'SUPPORT'), getTomorrowRoutesSummary);

// Billing
router.get('/billing/daily-report', authorize('ADMIN', 'INVENTORY_MNGR', 'BILLING_CLERK'), getDailyDeliveryReport);
router.get('/billing/overview', authorize('ADMIN', 'BILLING_CLERK'), getBillingOverview);
router.get('/bills/:id/pdf', authorize('ADMIN', 'BILLING_CLERK'), downloadAdminBillPDF);
router.post('/billing/generate', authorize('ADMIN', 'BILLING_CLERK'), generateMonthlyBills);
router.get('/billing/ledger/:customer_id', authorize('ADMIN', 'BILLING_CLERK'), getCustomerLedger);
router.post('/billing/finalize/:bill_id', authorize('ADMIN', 'BILLING_CLERK'), finalizeBill);
router.post('/bills/:id/pay', authorize('ADMIN', 'BILLING_CLERK'), validate(recordPaymentSchema), recordBillPayment);

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

module.exports = router;
