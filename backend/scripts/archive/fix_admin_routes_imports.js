const fs = require('fs');
let c = fs.readFileSync('src/routes/adminRoutes.js', 'utf8');

// Fix the destructuring at the top to include all newly added functions
c = c.replace(
  `const { 
    getDashboard, 
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
    getBillingOverview,
    getUpcomingExceptions,
    addManualException,
    getTomorrowRoutesSummary
}`,
  `const { 
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
    getBillingOverview,
    getUpcomingExceptions,
    addManualException,
    getTomorrowRoutesSummary
}`
);

// Remove duplicate const declarations that were added by patch scripts
c = c.replace(/,\n    getAuditLogs,\n} = /g, ',\n} = ');
c = c.replace(/,\n    getDeliveryPerformance,\n} = /g, ',\n} = ');
c = c.replace(/,\n    addWalletCredit,\n    getCustomerWalletHistory,\n} = /g, ',\n} = ');
c = c.replace(/,\n    downloadAdminBillPDF,\n} = /g, ',\n} = ');
c = c.replace(/,\n    getQuantityChangeRequests,\n    handleQuantityChangeRequest,\n} = /g, ',\n} = ');

fs.writeFileSync('src/routes/adminRoutes.js', c);
console.log('FIXED adminRoutes.js imports');
