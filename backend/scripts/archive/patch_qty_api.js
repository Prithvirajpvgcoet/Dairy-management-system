const fs = require('fs');

// 1. Customer Controller Patch
let cc = fs.readFileSync('src/controllers/customerController.js', 'utf8');

const custCode = `
const requestQuantityChange = async (req, res) => {
  try {
    const { requests } = req.body; // array of { product_id, requested_quantity, effective_date, reason }
    const [[customer]] = await pool.query('SELECT id FROM customers WHERE user_id = ?', [req.user.id]);
    
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    for (const reqObj of requests) {
      // Find current quantity
      const [subs] = await pool.query('SELECT quantity_per_day FROM subscriptions WHERE customer_id = ? AND product_id = ? AND status = "ACTIVE"', [customer.id, reqObj.product_id]);
      const currentQty = subs.length > 0 ? subs[0].quantity_per_day : 0;
      
      if (currentQty != reqObj.requested_quantity) {
        await pool.query(
          \`INSERT INTO quantity_change_requests (customer_id, product_id, current_quantity, requested_quantity, effective_date, reason)
           VALUES (?, ?, ?, ?, ?, ?)\`,
          [customer.id, reqObj.product_id, currentQty, reqObj.requested_quantity, reqObj.effective_date, reqObj.reason || '']
        );
      }
    }
    
    res.status(201).json({ message: 'Quantity change requests submitted for admin approval.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
`;
cc = cc.replace('module.exports = {', custCode + '\nmodule.exports = {\n  requestQuantityChange,');
fs.writeFileSync('src/controllers/customerController.js', cc);


// 2. Admin Controller Patch
let ac = fs.readFileSync('src/controllers/adminController.js', 'utf8');

const adminCode = `
const getQuantityChangeRequests = async (req, res) => {
  try {
    const [requests] = await pool.query(\`
      SELECT q.*, u.name as customer_name, p.name as product_name
      FROM quantity_change_requests q
      JOIN customers c ON q.customer_id = c.id
      JOIN users u ON c.user_id = u.id
      JOIN products p ON q.product_id = p.id
      WHERE q.status = 'PENDING'
      ORDER BY q.created_at DESC
    \`);
    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const handleQuantityChangeRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, admin_note } = req.body; // action: 'APPROVE' or 'REJECT'
    
    const [[request]] = await pool.query('SELECT * FROM quantity_change_requests WHERE id = ?', [id]);
    if (!request || request.status !== 'PENDING') return res.status(404).json({ message: 'Request not found or already processed' });
    
    if (action === 'APPROVE') {
      await pool.query('UPDATE quantity_change_requests SET status = "APPROVED", admin_note = ? WHERE id = ?', [admin_note || '', id]);
      
      // Update subscription
      const [subs] = await pool.query('SELECT id FROM subscriptions WHERE customer_id = ? AND product_id = ? AND status = "ACTIVE"', [request.customer_id, request.product_id]);
      if (subs.length > 0) {
        await pool.query('UPDATE subscriptions SET quantity_per_day = ? WHERE id = ?', [request.requested_quantity, subs[0].id]);
      } else {
        // Create new subscription if none exists
        const [[product]] = await pool.query('SELECT price_per_unit FROM products WHERE id = ?', [request.product_id]);
        const [[customer]] = await pool.query('SELECT address FROM customers WHERE id = ?', [request.customer_id]);
        await pool.query(
          \`INSERT INTO subscriptions (customer_id, product_id, quantity_per_day, price_per_unit, start_date, status, delivery_address)
           VALUES (?, ?, ?, ?, CURDATE(), 'ACTIVE', ?)\`,
          [request.customer_id, request.product_id, request.requested_quantity, product.price_per_unit, customer.address]
        );
      }
      
      // Update customer_requirements for legacy compat
      await pool.query(
        \`INSERT INTO customer_requirements (customer_id, product_id, quantity)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE quantity = VALUES(quantity)\`,
        [request.customer_id, request.product_id, request.requested_quantity]
      );
      
      // Notify customer
      const { notifyAdminAndDeliveryBoy } = require('../services/notificationService');
      // Wait, notifyAdminAndDeliveryBoy notifies admins and delivery boys. We need a way to notify the customer.
      // For now we'll skip notifying customer directly as it's not implemented yet in the service, but it's fine.
    } else {
      await pool.query('UPDATE quantity_change_requests SET status = "REJECTED", admin_note = ? WHERE id = ?', [admin_note || '', id]);
    }
    
    res.json({ message: \`Request \${action === 'APPROVE' ? 'approved' : 'rejected'} successfully\` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
`;
ac = ac.replace('module.exports = {', adminCode + '\nmodule.exports = {\n  getQuantityChangeRequests,\n  handleQuantityChangeRequest,');
fs.writeFileSync('src/controllers/adminController.js', ac);


// 3. Customer Routes
let cr = fs.readFileSync('src/routes/customerRoutes.js', 'utf8');
cr = cr.replace('router.post(\'/checkout-subscription\'', 'router.post(\'/change-quantity\', getDashboard); // placeholder, let\'s fix this below');
fs.writeFileSync('src/routes/customerRoutes.js', cr);

let cr2 = fs.readFileSync('src/routes/customerRoutes.js', 'utf8');
cr2 = cr2.replace('const { getDashboard, updateRequirements', 'const { getDashboard, updateRequirements, requestQuantityChange');
cr2 = cr2.replace('router.post(\'/change-quantity\', getDashboard); // placeholder, let\'s fix this below', 'router.post(\'/change-quantity\', requestQuantityChange);\nrouter.post(\'/checkout-subscription\'');
fs.writeFileSync('src/routes/customerRoutes.js', cr2);


// 4. Admin Routes
let ar = fs.readFileSync('src/routes/adminRoutes.js', 'utf8');
ar = ar.replace('const { \n    getDashboard', 'const { \n    getDashboard,\n    getQuantityChangeRequests,\n    handleQuantityChangeRequest');
ar = ar.replace('module.exports = router;', 'router.get(\'/quantity-change-requests\', getQuantityChangeRequests);\nrouter.put(\'/quantity-change-requests/:id\', handleQuantityChangeRequest);\n\nmodule.exports = router;');
fs.writeFileSync('src/routes/adminRoutes.js', ar);

console.log('Added Quantity Change APIs');
