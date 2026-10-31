const fs = require('fs');
let c = fs.readFileSync('src/controllers/adminController.js', 'utf8');

c = c.replace(
  '// Update customer_requirements for legacy compat',
  `// Update today's PENDING deliveries if effective date is today or earlier
      const todayStr = new Date().toISOString().split('T')[0];
      const reqDateStr = new Date(request.effective_date).toISOString().split('T')[0];
      if (reqDateStr <= todayStr) {
        await pool.query(
          \`UPDATE deliveries SET delivered_quantity = ? WHERE customer_id = ? AND date = ? AND status = 'PENDING'\`,
          [request.requested_quantity, request.customer_id, todayStr]
        );
      }
      
      // Update customer_requirements for legacy compat`
);

fs.writeFileSync('src/controllers/adminController.js', c);
console.log('patched');
