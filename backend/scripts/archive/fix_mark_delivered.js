const fs = require('fs');
let c = fs.readFileSync('src/controllers/deliveryController.js', 'utf8');

// Find and replace the broken markDelivered function
const startMarker = 'const markDelivered = async (req, res) => {';
const startIdx = c.indexOf(startMarker);

// Find the end: 'const collectPayment'
const endIdx = c.indexOf('\nconst collectPayment');

if (startIdx === -1 || endIdx === -1) {
    console.error('Could not find markDelivered boundaries!');
    process.exit(1);
}

const cleanMarkDelivered = `const markDelivered = async (req, res) => {
    try {
        const { customerId, delivered, quantity, status, actual_quantity, gps_latitude, gps_longitude } = req.body;
        const [deliveryBoy] = await pool.query('SELECT id FROM delivery_boys WHERE user_id = ?', [req.user.id]);
        const dbId = deliveryBoy[0].id;
        
        const deliveryStatus = status || (delivered ? 'DELIVERED' : 'NOT_DELIVERED');

        // Calculate total quantity for today's delivery
        const [[{ totalQty }]] = await pool.query(
            'SELECT COALESCE(SUM(quantity), 0) as totalQty FROM customer_requirements WHERE customer_id = ?', 
            [customerId]
        );
        const finalQuantity = quantity !== undefined ? quantity : parseFloat(totalQty);

        await pool.query(\`
            INSERT INTO deliveries (customer_id, delivery_boy_id, date, assigned_quantity, expected_quantity, delivered_quantity, actual_quantity, status, gps_latitude, gps_longitude, delivery_timestamp, marked_by)
            VALUES (?, ?, CURDATE(), ?, ?, ?, ?, ?, ?, ?, NOW(), ?)
            ON DUPLICATE KEY UPDATE 
              delivered_quantity = VALUES(delivered_quantity),
              actual_quantity = VALUES(actual_quantity),
              status = VALUES(status),
              gps_latitude = VALUES(gps_latitude),
              gps_longitude = VALUES(gps_longitude),
              delivery_timestamp = VALUES(delivery_timestamp),
              marked_by = VALUES(marked_by)
        \`, [customerId, dbId, finalQuantity, finalQuantity, delivered ? finalQuantity : 0, actual_quantity !== undefined ? actual_quantity : (delivered ? finalQuantity : 0), deliveryStatus, gps_latitude || null, gps_longitude || null, req.user.id]);

        // --- Inventory Auto-Deduction on successful delivery ---
        if (deliveryStatus === 'DELIVERED') {
            const [reqs] = await pool.query(
                'SELECT product_id, quantity_per_day as quantity FROM subscriptions WHERE customer_id = ? AND status = "ACTIVE"',
                [customerId]
            );
            
            for (const r of reqs) {
                const deductQty = parseFloat(r.quantity);
                
                await pool.query(\`
                    UPDATE inventory 
                    SET stock_out = stock_out + ?, 
                        total_available = total_available - ?
                    WHERE date = CURDATE() AND product_id = ?
                \`, [deductQty, deductQty, r.product_id]);
                
                // Low Stock Alert
                const [invRows] = await pool.query(
                    'SELECT total_available FROM inventory WHERE date = CURDATE() AND product_id = ?',
                    [r.product_id]
                );
                if (invRows.length > 0 && parseFloat(invRows[0].total_available) < 10) {
                    const [admins] = await pool.query('SELECT id FROM users WHERE role = "ADMIN"');
                    for (const admin of admins) {
                        await pool.query(
                            \`INSERT INTO notifications (user_id, title, message) VALUES (?, 'Low Stock Alert', ?)\`,
                            [admin.id, \`Low stock for Product ID \${r.product_id}. Only \${invRows[0].total_available} units left for today.\`]
                        );
                    }
                }
            }
        }

        res.json({ message: 'Delivery marked successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
`;

c = c.substring(0, startIdx) + cleanMarkDelivered + c.substring(endIdx);
fs.writeFileSync('src/controllers/deliveryController.js', c);
console.log('Fixed markDelivered in deliveryController.js');
