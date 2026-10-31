const pool = require('../config/db');

const getTodayRoute = async (req, res) => {
    try {
        const [deliveryBoy] = await pool.query('SELECT id FROM delivery_boys WHERE user_id = ?', [req.user.id]);
        
        if (deliveryBoy.length === 0) return res.status(404).json({ message: "Delivery boy profile not found" });
        const dbId = deliveryBoy[0].id;

        // Fetch assigned route stops sorted by stop_order
        const [route] = await pool.query(`
            SELECT 
                c.id as customer_id, u.name as customer, u.phone, c.address, c.gps_lat, c.gps_lng, 
                dr.stop_order,
                del.id as delivery_id,
                del.status as delivery_status,
                del.expected_quantity as del_expected,
                del.actual_quantity as del_actual,
                del.exception_reason
            FROM delivery_routes dr 
            JOIN customers c ON dr.customer_id = c.id
            JOIN users u ON c.user_id = u.id
            LEFT JOIN deliveries del ON del.customer_id = c.id AND del.date = CURDATE()
            WHERE dr.delivery_boy_id = ?
            ORDER BY COALESCE(dr.stop_order, 999999) ASC, c.id ASC
        `, [dbId]);

        // If route exists, fetch delivery_items or subscription items for each customer
        const formattedRoute = await Promise.all(route.map(async (r, index) => {
            let items = [];
            if (r.delivery_id) {
                const [itemRows] = await pool.query(`
                    SELECT di.id, di.product_id, di.subscription_qty, di.addon_qty, 
                           di.expected_qty, di.actual_qty, di.price_per_unit,
                           p.name as product_name, p.unit
                    FROM delivery_items di
                    JOIN products p ON di.product_id = p.id
                    WHERE di.delivery_id = ?
                `, [r.delivery_id]);
                items = itemRows;
            }

            // Fallback from subscriptions if delivery_items have not been generated yet
            if (items.length === 0) {
                const [subs] = await pool.query(`
                    SELECT s.product_id, s.quantity_per_day as subscription_qty, 0 as addon_qty,
                           s.quantity_per_day as expected_qty, 0 as actual_qty, s.price_per_unit,
                           p.name as product_name, p.unit
                    FROM subscriptions s
                    JOIN products p ON s.product_id = p.id
                    WHERE s.customer_id = ? AND s.status = 'ACTIVE'
                `, [r.customer_id]);
                items = subs;
            }

            const totalExpected = items.reduce((sum, it) => sum + parseFloat(it.expected_qty || it.subscription_qty || 0), 0);
            const totalActual = items.reduce((sum, it) => sum + parseFloat(it.actual_qty || 0), 0);
            const status = r.delivery_status || 'PENDING';

            return {
                id: r.customer_id,
                customer_id: r.customer_id,
                delivery_id: r.delivery_id || null,
                stop_order: r.stop_order || (index + 1),
                customer_name: r.customer,
                phone: r.phone,
                address: r.address,
                gps_lat: r.gps_lat,
                gps_lng: r.gps_lng,
                status: status,
                is_skipped: status === 'CUSTOMER_SKIPPED',
                exception_reason: r.exception_reason || null,
                expected_quantity: parseFloat(r.del_expected || totalExpected),
                actual_quantity: parseFloat(r.del_actual || totalActual),
                items: items
            };
        }));

        res.json(formattedRoute);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const markDelivered = async (req, res) => {
    try {
        const { customerId, delivered, quantity, status, actual_quantity, gps_latitude, gps_longitude, items, exception_reason } = req.body;
        const [deliveryBoy] = await pool.query('SELECT id FROM delivery_boys WHERE user_id = ?', [req.user.id]);
        if (deliveryBoy.length === 0) return res.status(404).json({ message: 'Delivery boy profile not found' });
        const dbId = deliveryBoy[0].id;
        
        const deliveryStatus = status || (delivered ? 'DELIVERED' : 'NOT_DELIVERED');

        // Calculate expected quantity from subscriptions
        const [[{ totalQty }]] = await pool.query(
            'SELECT COALESCE(SUM(quantity_per_day), 0) as totalQty FROM subscriptions WHERE customer_id = ? AND status = "ACTIVE"', 
            [customerId]
        );
        const expectedQuantity = parseFloat(totalQty || 0);
        const finalActualQty = actual_quantity !== undefined ? parseFloat(actual_quantity) : (delivered ? expectedQuantity : 0);

        // Upsert delivery record for today
        const [delResult] = await pool.query(`
            INSERT INTO deliveries 
                (customer_id, delivery_boy_id, date, assigned_quantity, expected_quantity, delivered_quantity, actual_quantity, status, gps_latitude, gps_longitude, delivery_timestamp, marked_by, exception_reason)
            VALUES (?, ?, CURDATE(), ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)
            ON DUPLICATE KEY UPDATE 
              delivered_quantity = VALUES(delivered_quantity),
              actual_quantity = VALUES(actual_quantity),
              status = VALUES(status),
              gps_latitude = VALUES(gps_latitude),
              gps_longitude = VALUES(gps_longitude),
              delivery_timestamp = VALUES(delivery_timestamp),
              marked_by = VALUES(marked_by),
              exception_reason = VALUES(exception_reason)
        `, [
            customerId, 
            dbId, 
            expectedQuantity, 
            expectedQuantity, 
            deliveryStatus === 'DELIVERED' ? finalActualQty : 0, 
            finalActualQty, 
            deliveryStatus, 
            gps_latitude || null, 
            gps_longitude || null, 
            req.user.id,
            exception_reason || null
        ]);

        // Get delivery ID
        const [[delRow]] = await pool.query('SELECT id FROM deliveries WHERE customer_id = ? AND date = CURDATE()', [customerId]);
        const deliveryId = delRow ? delRow.id : delResult.insertId;

        // Update delivery_items actual_qty if items array sent by client or single product
        if (Array.isArray(items) && items.length > 0) {
            for (const it of items) {
                if (it.product_id) {
                    await pool.query(
                        'UPDATE delivery_items SET actual_qty = ? WHERE delivery_id = ? AND product_id = ?',
                        [deliveryStatus === 'DELIVERED' ? parseFloat(it.actual_qty || 0) : 0, deliveryId, it.product_id]
                    );
                }
            }
        } else {
            await pool.query(
                'UPDATE delivery_items SET actual_qty = ? WHERE delivery_id = ?',
                [deliveryStatus === 'DELIVERED' ? finalActualQty : 0, deliveryId]
            );
        }

        // Inventory deduction on successful delivery
        if (deliveryStatus === 'DELIVERED') {
            const [delItems] = await pool.query('SELECT product_id, actual_qty FROM delivery_items WHERE delivery_id = ?', [deliveryId]);
            const itemsToDeduct = delItems.length > 0 ? delItems : [{ product_id: 1, actual_qty: finalActualQty }];

            for (const it of itemsToDeduct) {
                const deductQty = parseFloat(it.actual_qty || 0);
                if (deductQty > 0) {
                    await pool.query(`
                        UPDATE inventory 
                        SET stock_out = stock_out + ?, 
                            total_available = total_available - ?
                        WHERE date = CURDATE() AND product_id = ?
                    `, [deductQty, deductQty, it.product_id]);
                }
            }
        }

        res.json({ message: 'Delivery marked successfully', status: deliveryStatus });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const collectPayment = async (req, res) => {
    try {
        const { customerId, amount, method } = req.body;
        
        await pool.query(
            'INSERT INTO payments (customer_id, amount, payment_method, payment_date) VALUES (?, ?, ?, CURDATE())',
            [customerId, amount, method]
        );

        res.json({ message: 'Payment collected successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getSummary = async (req, res) => {
    try {
        const [deliveryBoy] = await pool.query('SELECT id FROM delivery_boys WHERE user_id = ?', [req.user.id]);
        if(deliveryBoy.length === 0) return res.status(404).json({message: "Delivery boy not found"});
        const dbId = deliveryBoy[0].id;

        const [summary] = await pool.query(`
            SELECT 
                COUNT(*) as total_assigned,
                SUM(CASE WHEN del.status = 'DELIVERED' THEN 1 ELSE 0 END) as delivered,
                SUM(CASE WHEN del.status = 'NOT_DELIVERED' THEN 1 ELSE 0 END) as pending
            FROM delivery_routes dr
            LEFT JOIN deliveries del ON del.customer_id = dr.customer_id AND del.date = CURDATE()
            WHERE dr.delivery_boy_id = ?
        `, [dbId]);

        res.json(summary[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getMyPerformance = async (req, res) => {
    try {
        const [[db]] = await pool.query('SELECT id, salary_type, salary_rate FROM delivery_boys WHERE user_id = ?', [req.user.id]);
        if (!db) return res.status(404).json({ message: 'Delivery partner profile not found' });

        const [history] = await pool.query(`
            SELECT 
                date,
                COUNT(*) as total_stops,
                SUM(CASE WHEN status = 'DELIVERED' THEN 1 ELSE 0 END) as delivered_stops,
                SUM(CASE WHEN status = 'CUSTOMER_SKIPPED' THEN 1 ELSE 0 END) as skipped_stops,
                SUM(CASE WHEN status = 'DELIVERED' THEN actual_quantity ELSE 0 END) as total_liters
            FROM deliveries
            WHERE delivery_boy_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            GROUP BY date
            ORDER BY date ASC
        `, [db.id]);

        const totalDelivered = history.reduce((s, h) => s + (parseInt(h.delivered_stops) || 0), 0);
        const totalStops = history.reduce((s, h) => s + (parseInt(h.total_stops) || 0), 0);
        const completionRate = totalStops > 0 ? ((totalDelivered / totalStops) * 100).toFixed(1) : 100;

        res.json({
            completion_rate: parseFloat(completionRate),
            on_time_rate: parseFloat(completionRate),
            total_delivered_stops: totalDelivered,
            total_stops: totalStops,
            history
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getTodayRoute, markDelivered, collectPayment, getSummary, getMyPerformance };
