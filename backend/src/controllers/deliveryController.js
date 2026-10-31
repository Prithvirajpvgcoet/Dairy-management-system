const pool = require('../config/db');

const getTodayRoute = async (req, res) => {
    try {
        // req.user.id is the User ID. We need the delivery_boy_id from it.
        const [deliveryBoy] = await pool.query('SELECT id FROM delivery_boys WHERE user_id = ?', [req.user.id]);
        
        if(deliveryBoy.length === 0) return res.status(404).json({message: "Delivery boy profile not found"});
        const dbId = deliveryBoy[0].id;

        // Get customers assigned to this delivery boy
        const [route] = await pool.query(`
            SELECT 
                c.id as customer_id, u.name as customer, c.address, c.gps_lat, c.gps_lng, 
                (SELECT GROUP_CONCAT(CONCAT(cr.quantity, ' ', p.unit, ' ', p.name) SEPARATOR ', ')
                 FROM customer_requirements cr 
                 JOIN products p ON cr.product_id = p.id 
                 WHERE cr.customer_id = c.id) as quantity,
                (SELECT COALESCE(SUM(s.quantity_per_day), 0) FROM subscriptions s WHERE s.customer_id = c.id AND s.status = 'ACTIVE') as subscription_qty,
                (SELECT COALESCE(SUM(da.addon_quantity), 0) FROM delivery_addons da WHERE da.customer_id = c.id AND da.delivery_date = CURDATE() AND da.status = 'APPROVED') as addon_quantity,
                del.status as delivery_status
            FROM delivery_routes dr 
            JOIN customers c ON dr.customer_id = c.id
            JOIN users u ON c.user_id = u.id
            LEFT JOIN deliveries del ON del.customer_id = c.id AND del.date = CURDATE() AND del.delivery_boy_id = dr.delivery_boy_id
            WHERE dr.delivery_boy_id = ?
        `, [dbId]);
        const formattedRoute = route.map(r => ({
            id: r.customer_id,
            customer_name: r.customer,
            address: r.address,
            delivered_quantity: r.quantity || 'No active req',
            subscription_qty: parseFloat(r.subscription_qty) || 0,
            addon_quantity: parseFloat(r.addon_quantity) || 0,
            expected_quantity: (parseFloat(r.subscription_qty) || 0) + (parseFloat(r.addon_quantity) || 0),
            status: r.delivery_status || 'PENDING'
        }));

        res.json(formattedRoute);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const markDelivered = async (req, res) => {
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

        await pool.query(`
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
        `, [customerId, dbId, finalQuantity, finalQuantity, delivered ? finalQuantity : 0, actual_quantity !== undefined ? actual_quantity : (delivered ? finalQuantity : 0), deliveryStatus, gps_latitude || null, gps_longitude || null, req.user.id]);

        // --- Inventory Auto-Deduction on successful delivery ---
        if (deliveryStatus === 'DELIVERED') {
            const [reqs] = await pool.query(
                'SELECT product_id, quantity_per_day as quantity FROM subscriptions WHERE customer_id = ? AND status = "ACTIVE"',
                [customerId]
            );
            
            for (const r of reqs) {
                const deductQty = parseFloat(r.quantity);
                
                await pool.query(`
                    UPDATE inventory 
                    SET stock_out = stock_out + ?, 
                        total_available = total_available - ?
                    WHERE date = CURDATE() AND product_id = ?
                `, [deductQty, deductQty, r.product_id]);
                
                // Low Stock Alert
                const [invRows] = await pool.query(
                    'SELECT total_available FROM inventory WHERE date = CURDATE() AND product_id = ?',
                    [r.product_id]
                );
                if (invRows.length > 0 && parseFloat(invRows[0].total_available) < 10) {
                    const [admins] = await pool.query('SELECT id FROM users WHERE role = "ADMIN"');
                    for (const admin of admins) {
                        await pool.query(
                            `INSERT INTO notifications (user_id, title, message) VALUES (?, 'Low Stock Alert', ?)`,
                            [admin.id, `Low stock for Product ID ${r.product_id}. Only ${invRows[0].total_available} units left for today.`]
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

const collectPayment = async (req, res) => {
    try {
        const { customerId, amount, method } = req.body; // method: CASH/UPI
        const [deliveryBoy] = await pool.query('SELECT id FROM delivery_boys WHERE user_id = ?', [req.user.id]);
        if(deliveryBoy.length === 0) return res.status(404).json({message: "Delivery boy profile not found"});
        const dbId = deliveryBoy[0].id;

        const [routeCheck] = await pool.query(
            'SELECT 1 FROM delivery_routes WHERE customer_id=? AND delivery_boy_id=?',
            [customerId, dbId]
        );
        if (routeCheck.length === 0) return res.status(403).json({ message: 'Not your customer' });

        await pool.query('UPDATE bills SET status="PAID" WHERE customer_id=? AND status="PENDING" ORDER BY id LIMIT 1', [customerId]);
        res.json({ message: 'Payment recorded' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getSummary = async (req, res) => {
    try {
        const [deliveryBoy] = await pool.query('SELECT id, salary_type, salary_rate FROM delivery_boys WHERE user_id = ?', [req.user.id]);
        if (deliveryBoy.length === 0) return res.status(404).json({ message: 'Delivery boy not found' });
        const dbId = deliveryBoy[0].id;

        const [[{ totalToday }]] = await pool.query('SELECT COUNT(*) as totalToday FROM deliveries WHERE delivery_boy_id = ? AND date = CURDATE()', [dbId]);
        const [[{ completed }]] = await pool.query('SELECT COUNT(*) as completed FROM deliveries WHERE delivery_boy_id = ? AND date = CURDATE() AND status = "DELIVERED"', [dbId]);
        const [[{ pending }]] = await pool.query('SELECT COUNT(*) as pending FROM deliveries WHERE delivery_boy_id = ? AND date = CURDATE() AND status = "PENDING"', [dbId]);
        const [[{ totalMilk }]] = await pool.query('SELECT COALESCE(SUM(delivered_quantity), 0) as totalMilk FROM deliveries WHERE delivery_boy_id = ? AND date = CURDATE() AND status="DELIVERED"', [dbId]);

        let estimatedEarnings = 0;
        if (deliveryBoy[0].salary_type === 'PER_LITER') {
            estimatedEarnings = parseFloat(totalMilk) * parseFloat(deliveryBoy[0].salary_rate);
        } else {
            estimatedEarnings = Math.round(parseFloat(deliveryBoy[0].salary_rate || 5000) / 30);
        }

        const [weeklyData] = await pool.query(`
            SELECT date, COALESCE(SUM(milk_delivered), 0) as milk_delivered
            FROM delivery_boy_daily
            WHERE delivery_boy_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            GROUP BY date ORDER BY date ASC
        `, [dbId]);

        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const weeklyEarnings = days.map((day, i) => {
            const entry = weeklyData[i];
            const milk = entry ? parseFloat(entry.milk_delivered) : 0;
            const rate = deliveryBoy[0].salary_type === 'PER_LITER' ? parseFloat(deliveryBoy[0].salary_rate || 8) : 8;
            return { day, earnings: Math.round(milk * rate) };
        });

        res.json({ totalToday, completed, pending, estimatedEarnings: Math.round(estimatedEarnings), weeklyEarnings });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


const getMyPerformance = async (req, res) => {
    try {
        const [[db]] = await pool.query('SELECT id FROM delivery_boys WHERE user_id = ?', [req.user.id]);
        if (!db) return res.status(404).json({ message: 'Delivery partner profile not found' });
        
        const [performance] = await pool.query(`
            SELECT 
                COUNT(d.id) as total_assigned,
                SUM(CASE WHEN d.status = 'DELIVERED' THEN 1 ELSE 0 END) as total_delivered,
                SUM(CASE WHEN d.status = 'CUSTOMER_SKIPPED' THEN 1 ELSE 0 END) as total_skipped,
                SUM(CASE WHEN d.status IN ('NOT_DELIVERED', 'DELIVERY_FAILED') THEN 1 ELSE 0 END) as total_missed,
                ROUND((SUM(CASE WHEN d.status = 'DELIVERED' THEN 1 ELSE 0 END) / NULLIF(COUNT(d.id) - SUM(CASE WHEN d.status = 'CUSTOMER_SKIPPED' THEN 1 ELSE 0 END), 0)) * 100, 2) as on_time_rate
            FROM deliveries d
            WHERE d.delivery_boy_id = ? AND d.date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        `, [db.id]);
        
        res.json(performance[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
  getMyPerformance, getTodayRoute, markDelivered, collectPayment, getSummary };