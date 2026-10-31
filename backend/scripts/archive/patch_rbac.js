const fs = require('fs');

let c = fs.readFileSync('src/routes/adminRoutes.js', 'utf8');

c = c.replace("router.use(authorize('ADMIN'));", "// Removed global admin check to allow granular roles");

// Add specific checks
// Dashboard -> All staff
c = c.replace('router.get(\'/dashboard\', getDashboard);', 'router.get(\'/dashboard\', authorize(\'ADMIN\', \'INVENTORY_MNGR\', \'BILLING_CLERK\', \'SUPPORT\'), getDashboard);');
c = c.replace('router.get(\'/performance\', getDeliveryPerformance);', 'router.get(\'/performance\', authorize(\'ADMIN\', \'SUPPORT\'), getDeliveryPerformance);');

// Customers -> ADMIN, SUPPORT
c = c.replace('router.post(\'/customers\', validate(customerSchema), addCustomer);', 'router.post(\'/customers\', authorize(\'ADMIN\', \'SUPPORT\'), validate(customerSchema), addCustomer);');
c = c.replace('router.get(\'/customers\', getCustomers);', 'router.get(\'/customers\', authorize(\'ADMIN\', \'SUPPORT\'), getCustomers);');

// Delivery Boys -> ADMIN, SUPPORT
c = c.replace('router.post(\'/delivery-boys\', validate(deliveryBoySchema), addDeliveryBoy);', 'router.post(\'/delivery-boys\', authorize(\'ADMIN\', \'SUPPORT\'), validate(deliveryBoySchema), addDeliveryBoy);');
c = c.replace('router.get(\'/delivery-boys\', getDeliveryBoys);', 'router.get(\'/delivery-boys\', authorize(\'ADMIN\', \'SUPPORT\'), getDeliveryBoys);');

// Routes -> ADMIN, SUPPORT
c = c.replace('router.post(\'/routes\', validate(assignRouteSchema), assignRoute);', 'router.post(\'/routes\', authorize(\'ADMIN\', \'SUPPORT\'), validate(assignRouteSchema), assignRoute);');
c = c.replace('router.get(\'/routes/exceptions\', getUpcomingExceptions);', 'router.get(\'/routes/exceptions\', authorize(\'ADMIN\', \'SUPPORT\'), getUpcomingExceptions);');
c = c.replace('router.post(\'/routes/exceptions\', addManualException);', 'router.post(\'/routes/exceptions\', authorize(\'ADMIN\', \'SUPPORT\'), addManualException);');
c = c.replace('router.get(\'/routes/tomorrow\', getTomorrowRoutesSummary);', 'router.get(\'/routes/tomorrow\', authorize(\'ADMIN\', \'SUPPORT\'), getTomorrowRoutesSummary);');

// Quantity Changes -> ADMIN, SUPPORT
c = c.replace('router.get(\'/quantity-change-requests\', getQuantityChangeRequests);', 'router.get(\'/quantity-change-requests\', authorize(\'ADMIN\', \'SUPPORT\'), getQuantityChangeRequests);');
c = c.replace('router.put(\'/quantity-change-requests/:id\', handleQuantityChangeRequest);', 'router.put(\'/quantity-change-requests/:id\', authorize(\'ADMIN\', \'SUPPORT\'), handleQuantityChangeRequest);');

// Products -> ADMIN, INVENTORY_MNGR
c = c.replace('router.get(\'/products\', list);', 'router.get(\'/products\', authorize(\'ADMIN\', \'INVENTORY_MNGR\'), list);');
c = c.replace('router.post(\'/products\', validate(productSchema), create);', 'router.post(\'/products\', authorize(\'ADMIN\', \'INVENTORY_MNGR\'), validate(productSchema), create);');
c = c.replace('router.put(\'/products/:id\', validate(productSchema), update);', 'router.put(\'/products/:id\', authorize(\'ADMIN\', \'INVENTORY_MNGR\'), validate(productSchema), update);');
c = c.replace('router.delete(\'/products/:id\', remove);', 'router.delete(\'/products/:id\', authorize(\'ADMIN\', \'INVENTORY_MNGR\'), remove);');

// Inventory -> ADMIN, INVENTORY_MNGR
c = c.replace('router.get(\'/inventory\', getInventory);', 'router.get(\'/inventory\', authorize(\'ADMIN\', \'INVENTORY_MNGR\'), getInventory);');
c = c.replace('router.post(\'/inventory\', updateInventory);', 'router.post(\'/inventory\', authorize(\'ADMIN\', \'INVENTORY_MNGR\'), updateInventory);');
c = c.replace('router.get(\'/reports/daily\', getDailyDeliveryReport);', 'router.get(\'/reports/daily\', authorize(\'ADMIN\', \'INVENTORY_MNGR\', \'BILLING_CLERK\'), getDailyDeliveryReport);');

// Billing/Ledger -> ADMIN, BILLING_CLERK
c = c.replace('router.get(\'/ledger/:customerId\', getCustomerLedger);', 'router.get(\'/ledger/:customerId\', authorize(\'ADMIN\', \'BILLING_CLERK\'), getCustomerLedger);');
c = c.replace('router.post(\'/billing/generate\', generateMonthlyBills);', 'router.post(\'/billing/generate\', authorize(\'ADMIN\', \'BILLING_CLERK\'), generateMonthlyBills);');
c = c.replace('router.get(\'/billing/overview\', getBillingOverview);', 'router.get(\'/billing/overview\', authorize(\'ADMIN\', \'BILLING_CLERK\'), getBillingOverview);');
c = c.replace('router.get(\'/bills/:id/pdf\', downloadAdminBillPDF);', 'router.get(\'/bills/:id/pdf\', authorize(\'ADMIN\', \'BILLING_CLERK\'), downloadAdminBillPDF);');
c = c.replace('router.put(\'/billing/finalize/:bill_id\', finalizeBill);', 'router.put(\'/billing/finalize/:bill_id\', authorize(\'ADMIN\', \'BILLING_CLERK\'), finalizeBill);');

// Wallet -> ADMIN, BILLING_CLERK
c = c.replace('router.post(\'/wallet/credit\', addWalletCredit);', 'router.post(\'/wallet/credit\', authorize(\'ADMIN\', \'BILLING_CLERK\'), addWalletCredit);');
c = c.replace('router.get(\'/wallet/:customer_id\', getCustomerWalletHistory);', 'router.get(\'/wallet/:customer_id\', authorize(\'ADMIN\', \'BILLING_CLERK\'), getCustomerWalletHistory);');

fs.writeFileSync('src/routes/adminRoutes.js', c);
console.log('patched adminRoutes');
