const fs = require('fs');

// 1. Update finalizeBill logic in adminController
let ac = fs.readFileSync('src/controllers/adminController.js', 'utf8');

const finalizeBillPatch = `
const finalizeBill = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { bill_id } = req.params;
        
        const [bills] = await connection.query('SELECT * FROM bills WHERE id = ?', [bill_id]);
        if (bills.length === 0) return res.status(404).json({ message: 'Bill not found' });
        const bill = bills[0];
        if (bill.status === 'FINAL' || bill.status === 'PAID') {
            await connection.rollback();
            return res.status(400).json({ message: 'Bill already finalized' });
        }
        
        // Fetch customer wallet balance
        const [[customer]] = await connection.query('SELECT wallet_balance FROM customers WHERE id = ?', [bill.customer_id]);
        let walletBalance = parseFloat(customer.wallet_balance || 0);
        let billAmount = parseFloat(bill.amount);
        let finalStatus = 'PENDING';
        
        if (walletBalance > 0) {
            let amountToDeduct = Math.min(walletBalance, billAmount);
            walletBalance -= amountToDeduct;
            
            // Deduct from wallet
            await connection.query('UPDATE customers SET wallet_balance = ? WHERE id = ?', [walletBalance, bill.customer_id]);
            await connection.query(\`
                INSERT INTO wallet_transactions (customer_id, type, amount, description, reference_id, reference_type, balance_after, created_by)
                VALUES (?, 'DEBIT', ?, ?, ?, 'BILL', ?, ?)
            \`, [bill.customer_id, amountToDeduct, \`Auto-deducted for Bill #\${bill_id} (\${bill.month}/\${bill.year})\`, bill_id, walletBalance, req.user.id]);
            
            if (amountToDeduct >= billAmount) {
                finalStatus = 'PAID';
            }
        }
        
        await connection.query(\`
            UPDATE bills SET status = ?, finalized_at = NOW(), finalized_by = ?
            WHERE id = ?
        \`, [finalStatus, req.user.id, bill_id]);
        
        await connection.query(\`
            INSERT INTO audit_log (user_id, action, entity_type, entity_id, old_value, new_value, notes)
            VALUES (?, 'BILL_FINALIZED', 'bill', ?, ?, ?, ?)
        \`, [
            req.user.id, bill_id,
            JSON.stringify({ status: bill.status }),
            JSON.stringify({ status: finalStatus }),
            \`Bill finalized by admin for customer \${bill.customer_id} - \${bill.month}/\${bill.year}\`
        ]);
        
        await connection.commit();
        res.json({ message: 'Bill finalized' + (finalStatus === 'PAID' ? ' and auto-paid from wallet' : '') });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: error.message || error.toString() });
    } finally {
        connection.release();
    }
};
`;

const startIndex = ac.indexOf('const finalizeBill = async (req, res) => {');
const endIndex = ac.indexOf('const getBillingOverview = async', startIndex);
ac = ac.substring(0, startIndex) + finalizeBillPatch + ac.substring(endIndex);

const walletEndpointsAdmin = `
const addWalletCredit = async (req, res) => {
    try {
        const { customer_id, amount, description } = req.body;
        if (!customer_id || !amount) return res.status(400).json({ message: 'Customer ID and amount are required' });
        
        const [[customer]] = await pool.query('SELECT wallet_balance FROM customers WHERE id = ?', [customer_id]);
        if (!customer) return res.status(404).json({ message: 'Customer not found' });
        
        const newBalance = parseFloat(customer.wallet_balance || 0) + parseFloat(amount);
        
        await pool.query('UPDATE customers SET wallet_balance = ? WHERE id = ?', [newBalance, customer_id]);
        await pool.query(\`
            INSERT INTO wallet_transactions (customer_id, type, amount, description, balance_after, created_by)
            VALUES (?, 'CREDIT', ?, ?, ?, ?)
        \`, [customer_id, amount, description || 'Admin manual credit', newBalance, req.user.id]);
        
        res.json({ message: 'Credit added successfully', new_balance: newBalance });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getCustomerWalletHistory = async (req, res) => {
    try {
        const { customer_id } = req.params;
        const [[customer]] = await pool.query('SELECT wallet_balance FROM customers WHERE id = ?', [customer_id]);
        const [transactions] = await pool.query('SELECT * FROM wallet_transactions WHERE customer_id = ? ORDER BY created_at DESC', [customer_id]);
        
        res.json({ balance: customer ? customer.wallet_balance : 0, transactions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
`;

ac = ac.replace('module.exports = {', walletEndpointsAdmin + '\nmodule.exports = {\n  addWalletCredit,\n  getCustomerWalletHistory,');
fs.writeFileSync('src/controllers/adminController.js', ac);


// 2. Customer Controller Wallet API
let cc = fs.readFileSync('src/controllers/customerController.js', 'utf8');
const walletEndpointsCustomer = `
const getMyWallet = async (req, res) => {
    try {
        const [[customer]] = await pool.query('SELECT id, wallet_balance FROM customers WHERE user_id = ?', [req.user.id]);
        if (!customer) return res.status(404).json({ message: 'Customer not found' });
        
        const [transactions] = await pool.query('SELECT * FROM wallet_transactions WHERE customer_id = ? ORDER BY created_at DESC', [customer.id]);
        
        res.json({ balance: customer.wallet_balance, transactions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
`;
cc = cc.replace('module.exports = {', walletEndpointsCustomer + '\nmodule.exports = {\n  getMyWallet,');
fs.writeFileSync('src/controllers/customerController.js', cc);


// 3. Admin Routes
let ar = fs.readFileSync('src/routes/adminRoutes.js', 'utf8');
ar = ar.replace('const { \n    getDashboard,', 'const { \n    getDashboard,\n    addWalletCredit,\n    getCustomerWalletHistory,');
ar = ar.replace('module.exports = router;', 'router.post(\'/wallet/credit\', addWalletCredit);\nrouter.get(\'/wallet/:customer_id\', getCustomerWalletHistory);\n\nmodule.exports = router;');
fs.writeFileSync('src/routes/adminRoutes.js', ar);


// 4. Customer Routes
let cr = fs.readFileSync('src/routes/customerRoutes.js', 'utf8');
cr = cr.replace('const { getDashboard, updateRequirements, requestQuantityChange, getOrders, getBills, getAccount, checkoutSubscription, checkoutOnetime } = require(\'../controllers/customerController\');', 'const { getDashboard, updateRequirements, requestQuantityChange, getOrders, getBills, getAccount, checkoutSubscription, checkoutOnetime, getMyWallet } = require(\'../controllers/customerController\');');
cr = cr.replace('router.get(\'/account\', getAccount);', 'router.get(\'/account\', getAccount);\nrouter.get(\'/wallet\', getMyWallet);');
fs.writeFileSync('src/routes/customerRoutes.js', cr);

console.log('Added Wallet APIs');
