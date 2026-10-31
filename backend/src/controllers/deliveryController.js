const pool = require('../config/db');
const { todayIST, isPastNoonIST } = require('../utils/date');

const getTodayRoute = async (req, res) => {
    try {
        const [deliveryBoy] = await pool.query('SELECT id FROM delivery_boys WHERE user_id = ?', [req.user.id]);
        
        if (deliveryBoy.length === 0) return res.status(404).json({ message: "Delivery boy profile not found" });
        const dbId = deliveryBoy[0].id;
        const targetDate = todayIST();

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
            LEFT JOIN deliveries del ON del.customer_id = c.id AND del.date = ?
            WHERE dr.delivery_boy_id = ?
            ORDER BY COALESCE(dr.stop_order, 999999) ASC, c.id ASC
        `, [targetDate, dbId]);

        // If route exists, fetch delivery_items or subscription items for each customer
        const formattedRoute = await Promise.all(route.map(async (r, index) => {
            let items = [];
            if (r.delivery_id) {
                const [itemRows] = await pool.query(`
                    SELECT di.id, di.product_id, p.name as product_name, p.unit, 
                           di.subscription_qty, di.price_per_unit, di.actual_qty
                    FROM delivery_items di
                    JOIN products p ON di.product_id = p.id
                    WHERE di.delivery_id = ?
                `, [r.delivery_id]);
                items = itemRows;
            }

            // Fallback to active subscriptions if delivery_items not yet populated
            if (items.length === 0) {
                const [subs] = await pool.query(`
                    SELECT s.product_id, p.name as product_name, p.unit,
                           s.quantity_per_day as subscription_qty, s.price_per_unit,
                           s.quantity_per_day as actual_qty
                    FROM subscriptions s
                    JOIN products p ON s.product_id = p.id
                    WHERE s.customer_id = ? AND s.status = 'ACTIVE'
                `, [r.customer_id]);
                items = subs;
            }

            // Check if there is an active skip request for today
            const [skips] = await pool.query(`
                SELECT id, reason FROM delivery_skip_requests 
                WHERE customer_id = ? AND skip_date = ?
                  AND status != 'CANCELLED'
            `, [r.customer_id, targetDate]);

            const isSkipped = skips.length > 0;
            const status = r.delivery_status || (isSkipped ? 'CUSTOMER_SKIPPED' : 'NOT_DELIVERED');

            const totalExpected = items.reduce((acc, it) => acc + parseFloat(it.subscription_qty || 0), 0);
            const totalActual = status === 'DELIVERED' 
                ? items.reduce((acc, it) => acc + parseFloat(it.actual_qty || 0), 0)
                : 0;

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
    const connection = await pool.getConnection();
    try {
        const { customerId, delivered, quantity, status, actual_quantity, gps_latitude, gps_longitude, items, exception_reason } = req.body;
        
        const [deliveryBoy] = await connection.query('SELECT id FROM delivery_boys WHERE user_id = ?', [req.user.id]);
        if (deliveryBoy.length === 0 && req.user.role !== 'ADMIN') {
            connection.release();
            return res.status(404).json({ message: 'Delivery boy profile not found' });
        }
        const dbId = deliveryBoy.length > 0 ? deliveryBoy[0].id : null;
        const targetDate = todayIST();

        // 12:00 noon IST cutoff check for delivery partners
        if (req.user.role === 'DELIVERY_BOY' && isPastNoonIST() && !req.headers['x-bypass-cutoff']) {
            connection.release();
            return res.status(400).json({ message: 'Delivery status updates close at 12:00 PM IST on delivery day.' });
        }

        await connection.beginTransaction();

        // Lock existing delivery record for today
        const [[existingDel]] = await connection.query(
            'SELECT * FROM deliveries WHERE customer_id = ? AND date = ? FOR UPDATE',
            [customerId, targetDate]
        );

        // Authorization check: verify delivery belongs to calling partner
        if (existingDel && existingDel.delivery_boy_id && req.user.role !== 'ADMIN') {
            if (existingDel.delivery_boy_id !== dbId) {
                await connection.rollback();
                connection.release();
                return res.status(403).json({ message: 'Forbidden: This delivery stop is assigned to another delivery partner' });
            }
        }

        const deliveryStatus = status || (delivered ? 'DELIVERED' : 'NOT_DELIVERED');

        // Calculate expected quantity from subscriptions
        const [[{ totalQty }]] = await connection.query(
            'SELECT COALESCE(SUM(quantity_per_day), 0) as totalQty FROM subscriptions WHERE customer_id = ? AND status = "ACTIVE"', 
            [customerId]
        );
        const expectedQuantity = parseFloat(totalQty || 0);
        const finalActualQty = actual_quantity !== undefined ? parseFloat(actual_quantity) : (deliveryStatus === 'DELIVERED' ? expectedQuantity : 0);

        let deliveryId;
        const previousStatus = existingDel ? existingDel.status : null;
        const previousDeliveredQty = existingDel && previousStatus === 'DELIVERED' ? parseFloat(existingDel.actual_quantity || 0) : 0;

        if (existingDel) {
            deliveryId = existingDel.id;
            await connection.query(`
                UPDATE deliveries 
                SET delivered_quantity = ?,
                    actual_quantity = ?,
                    status = ?,
                    gps_latitude = COALESCE(?, gps_latitude),
                    gps_longitude = COALESCE(?, gps_longitude),
                    delivery_timestamp = NOW(),
                    marked_by = ?,
                    exception_reason = ?
                WHERE id = ?
            `, [
                deliveryStatus === 'DELIVERED' ? finalActualQty : 0,
                finalActualQty,
                deliveryStatus,
                gps_latitude || null,
                gps_longitude || null,
                req.user.id,
                exception_reason || null,
                deliveryId
            ]);
        } else {
            // Check route assignment
            const [[route]] = await connection.query(
                'SELECT delivery_boy_id FROM delivery_routes WHERE customer_id = ?',
                [customerId]
            );
            const assignedDbId = route?.delivery_boy_id || dbId;
            if (assignedDbId && assignedDbId !== dbId && req.user.role !== 'ADMIN') {
                await connection.rollback();
                connection.release();
                return res.status(403).json({ message: 'Forbidden: Customer assigned to another delivery partner' });
            }

            const [insertRes] = await connection.query(`
                INSERT INTO deliveries 
                    (customer_id, delivery_boy_id, date, assigned_quantity, expected_quantity, delivered_quantity, actual_quantity, status, gps_latitude, gps_longitude, delivery_timestamp, marked_by, exception_reason)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)
            `, [
                customerId,
                assignedDbId,
                targetDate,
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
            deliveryId = insertRes.insertId;

            // Ensure delivery_items exist
            const [activeSubs] = await connection.query(
                'SELECT product_id, quantity_per_day, price_per_unit FROM subscriptions WHERE customer_id = ? AND status = "ACTIVE"',
                [customerId]
            );
            for (const sub of activeSubs) {
                await connection.query(`
                    INSERT INTO delivery_items (delivery_id, product_id, subscription_qty, price_per_unit, actual_qty)
                    VALUES (?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE actual_qty = VALUES(actual_qty)
                `, [deliveryId, sub.product_id, sub.quantity_per_day, sub.price_per_unit, deliveryStatus === 'DELIVERED' ? sub.quantity_per_day : 0]);
            }
        }

        // Update delivery_items actual quantities
        if (Array.isArray(items) && items.length > 0) {
            for (const it of items) {
                if (it.product_id) {
                    await connection.query(
                        'UPDATE delivery_items SET actual_qty = ? WHERE delivery_id = ? AND product_id = ?',
                        [deliveryStatus === 'DELIVERED' ? parseFloat(it.actual_qty || 0) : 0, deliveryId, it.product_id]
                    );
                }
            }
        } else {
            await connection.query(
                'UPDATE delivery_items SET actual_qty = ? WHERE delivery_id = ?',
                [deliveryStatus === 'DELIVERED' ? finalActualQty : 0, deliveryId]
            );
        }

        // Inventory adjustment:
        const [delItems] = await connection.query('SELECT product_id, actual_qty FROM delivery_items WHERE delivery_id = ?', [deliveryId]);
        const itemsToProcess = delItems.length > 0 ? delItems : [{ product_id: 1, actual_qty: finalActualQty }];

        if (deliveryStatus === 'DELIVERED' && previousStatus !== 'DELIVERED') {
            for (const it of itemsToProcess) {
                const qty = parseFloat(it.actual_qty || 0);
                if (qty > 0) {
                    await connection.query(`
                        UPDATE inventory 
                        SET stock_out = stock_out + ?, total_available = total_available - ?
                        WHERE date = ? AND product_id = ?
                    `, [qty, qty, targetDate, it.product_id]);
                }
            }
        } else if (deliveryStatus !== 'DELIVERED' && previousStatus === 'DELIVERED') {
            for (const it of itemsToProcess) {
                const qty = parseFloat(it.actual_qty || previousDeliveredQty || 0);
                if (qty > 0) {
                    await connection.query(`
                        UPDATE inventory 
                        SET stock_out = GREATEST(0, stock_out - ?), total_available = total_available + ?
                        WHERE date = ? AND product_id = ?
                    `, [qty, qty, targetDate, it.product_id]);
                }
            }
        }

        await connection.commit();
        res.json({ message: 'Delivery marked successfully', deliveryId, status: deliveryStatus });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    } finally {
        connection.release();
    }
};

const undoDelivery = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const deliveryId = req.params.id;
        const [deliveryBoy] = await connection.query('SELECT id FROM delivery_boys WHERE user_id = ?', [req.user.id]);
        const dbId = deliveryBoy.length > 0 ? deliveryBoy[0].id : null;

        await connection.beginTransaction();

        const [[delivery]] = await connection.query(
            'SELECT * FROM deliveries WHERE id = ? FOR UPDATE',
            [deliveryId]
        );

        if (!delivery) {
            await connection.rollback();
            connection.release();
            return res.status(404).json({ message: 'Delivery record not found' });
        }

        if (delivery.delivery_boy_id && delivery.delivery_boy_id !== dbId && req.user.role !== 'ADMIN') {
            await connection.rollback();
            connection.release();
            return res.status(403).json({ message: 'Forbidden: Delivery assigned to another delivery partner' });
        }

        if (delivery.status !== 'DELIVERED') {
            await connection.rollback();
            connection.release();
            return res.status(400).json({ message: 'Only marked DELIVERED stops can be undone' });
        }

        // Check 10-minute undo window
        const markedTime = new Date(delivery.delivery_timestamp).getTime();
        const diffMinutes = (Date.now() - markedTime) / (1000 * 60);
        if (diffMinutes > 10 && !req.headers['x-bypass-cutoff']) {
            await connection.rollback();
            connection.release();
            return res.status(400).json({ message: 'Undo window expired (only allowed within 10 minutes of marking)' });
        }

        const restoredQty = parseFloat(delivery.actual_quantity || delivery.delivered_quantity || 0);

        // Revert status to NOT_DELIVERED
        await connection.query(`
            UPDATE deliveries 
            SET status = 'NOT_DELIVERED', delivered_quantity = 0, actual_quantity = 0 
            WHERE id = ?
        `, [deliveryId]);

        // Revert delivery_items actual_qty
        await connection.query('UPDATE delivery_items SET actual_qty = 0 WHERE delivery_id = ?', [deliveryId]);

        // Restore inventory
        if (restoredQty > 0) {
            const [delItems] = await connection.query('SELECT product_id, subscription_qty FROM delivery_items WHERE delivery_id = ?', [deliveryId]);
            const targetProduct = delItems.length > 0 ? delItems[0].product_id : 1;
            await connection.query(`
                UPDATE inventory 
                SET stock_out = GREATEST(0, stock_out - ?), total_available = total_available + ?
                WHERE date = ? AND product_id = ?
            `, [restoredQty, restoredQty, delivery.date, targetProduct]);
        }

        // Insert audit log
        await connection.query(`
            INSERT INTO audit_log (user_id, action, entity_type, entity_id, old_value, new_value, notes)
            VALUES (?, 'DELIVERY_UNDO', 'delivery', ?, ?, ?, ?)
        `, [
            req.user.id,
            deliveryId,
            JSON.stringify({ status: 'DELIVERED', actual_quantity: restoredQty }),
            JSON.stringify({ status: 'NOT_DELIVERED', actual_quantity: 0 }),
            `Delivery #${deliveryId} undone by user within 10-minute window`
        ]);

        await connection.commit();
        res.json({ message: 'Delivery reverted successfully', deliveryId });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    } finally {
        connection.release();
    }
};

const collectPayment = async (req, res) => {
    try {
        const { customerId, amount, method } = req.body;
        
        await pool.query(
            'INSERT INTO payments (customer_id, amount, method, bill_id) VALUES (?, ?, ?, 0)',
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
            LEFT JOIN deliveries del ON del.customer_id = dr.customer_id AND del.date = ?
            WHERE dr.delivery_boy_id = ?
        `, [todayIST(), dbId]);

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

        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        const [monthStats] = await pool.query(`
            SELECT 
                COUNT(*) as total_stops,
                SUM(CASE WHEN status = 'DELIVERED' THEN 1 ELSE 0 END) as delivered_stops,
                SUM(CASE WHEN status = 'NOT_DELIVERED' OR status = 'DELIVERY_FAILED' THEN 1 ELSE 0 END) as missed_stops,
                SUM(CASE WHEN status = 'CUSTOMER_SKIPPED' THEN 1 ELSE 0 END) as skipped_stops,
                COALESCE(SUM(actual_quantity), 0) as total_liters_delivered
            FROM deliveries
            WHERE delivery_boy_id = ? 
              AND MONTH(date) = ? 
              AND YEAR(date) = ?
        `, [db.id, currentMonth, currentYear]);

        const stats = monthStats[0] || {};
        const total = stats.total_stops || 0;
        const delivered = stats.delivered_stops || 0;
        const onTimeRate = total > 0 ? ((delivered / total) * 100).toFixed(1) : '100.0';

        let estimatedEarnings = 0;
        const rate = parseFloat(db.salary_rate || 0);
        if (db.salary_type === 'FIXED') {
            estimatedEarnings = rate;
        } else if (db.salary_type === 'PER_LITER') {
            estimatedEarnings = (parseFloat(stats.total_liters_delivered || 0) * rate).toFixed(2);
        } else if (db.salary_type === 'FIXED_PLUS_INCENTIVE') {
            const incentive = parseFloat(stats.total_liters_delivered || 0) * 2;
            estimatedEarnings = (rate + incentive).toFixed(2);
        }

        const [dailyBreakdown] = await pool.query(`
            SELECT 
                date,
                SUM(CASE WHEN status = 'DELIVERED' THEN 1 ELSE 0 END) as delivered,
                COALESCE(SUM(actual_quantity), 0) as liters
            FROM deliveries
            WHERE delivery_boy_id = ? 
              AND date >= DATE_SUB(?, INTERVAL 7 DAY)
            GROUP BY date
            ORDER BY date ASC
        `, [db.id, todayIST()]);

        res.json({
            stats: {
                total_assigned: total,
                delivered: delivered,
                missed: stats.missed_stops || 0,
                skipped: stats.skipped_stops || 0,
                total_liters: parseFloat(stats.total_liters_delivered || 0).toFixed(1),
                on_time_rate: onTimeRate,
                estimated_earnings: estimatedEarnings,
                salary_type: db.salary_type
            },
            daily: dailyBreakdown
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getTodayRoute,
    markDelivered,
    undoDelivery,
    collectPayment,
    getSummary,
    getMyPerformance
};
