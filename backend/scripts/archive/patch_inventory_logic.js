const fs = require('fs');

let c = fs.readFileSync('src/controllers/deliveryController.js', 'utf8');

c = c.replace(
  'VALUES(marked_by)',
  `VALUES(marked_by)
          \`);
          
          // --- Feature 7: Inventory Auto-Deduction ---
          if (deliveryStatus === 'DELIVERED') {
              const [reqs] = await pool.query('SELECT product_id, quantity_per_day as quantity FROM subscriptions WHERE customer_id = ? AND status = "ACTIVE"', [customerId]);
              
              for (const r of reqs) {
                  let deductQty = parseFloat(r.quantity);
                  
                  // Deduct from inventory
                  await pool.query(\`
                      UPDATE inventory 
                      SET stock_out = stock_out + ?, 
                          total_available = total_available - ?
                      WHERE date = CURDATE() AND product_id = ?
                  \`, [deductQty, deductQty, r.product_id]);
                  
                  // Low Stock Alert
                  const [invRows] = await pool.query('SELECT total_available FROM inventory WHERE date = CURDATE() AND product_id = ?', [r.product_id]);
                  if (invRows.length > 0) {
                      const available = invRows[0].total_available;
                      if (available < 10) { // threshold
                          const [admins] = await pool.query('SELECT id FROM users WHERE role = "ADMIN"');
                          for (const admin of admins) {
                              await pool.query(\`
                                  INSERT INTO notifications (user_id, title, message) 
                                  VALUES (?, 'Low Stock Alert', ?)
                              \`, [admin.id, \`Low stock for Product ID \${r.product_id}. Only \${available} units left for today.\`]);
                          }
                      }
                  }
              }
          }`
);

fs.writeFileSync('src/controllers/deliveryController.js', c);
console.log('patched inventory auto deduction');
