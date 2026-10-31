const pool = require('../config/db');
const { todayIST, addDays } = require('../utils/date');

/**
 * Idempotently generates deliveries and delivery_items for a specified date (IST 'YYYY-MM-DD').
 *
 * @param {string} targetDate - Target delivery date 'YYYY-MM-DD'
 * @returns {Promise<{ generated: number, skipped: number, unassigned: number, totalCustomers: number, date: string }>}
 */
async function generateForDate(targetDate) {
    const date = targetDate || todayIST();
    console.log(`[DeliveryGenerator] Running daily generation for date: ${date}`);

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Fetch all customers with an ACTIVE subscription valid on date
        const [subRows] = await connection.query(`
            SELECT 
                s.customer_id,
                s.product_id,
                s.quantity_per_day as subscription_qty,
                s.price_per_unit as sub_price,
                p.price_per_unit as current_product_price,
                p.name as product_name
            FROM subscriptions s
            JOIN products p ON s.product_id = p.id
            WHERE s.status = 'ACTIVE'
              AND s.start_date <= ?
              AND (s.end_date IS NULL OR s.end_date >= ?)
        `, [date, date]);

        // 2. Fetch all APPROVED addons for this date
        const [addonRows] = await connection.query(`
            SELECT 
                da.customer_id,
                da.product_id,
                da.addon_quantity,
                da.price_per_unit,
                p.name as product_name
            FROM delivery_addons da
            JOIN products p ON da.product_id = p.id
            WHERE da.delivery_date = ?
              AND da.status = 'APPROVED'
        `, [date]);

        // 3. Fetch all skips for this date
        const [skipRows] = await connection.query(`
            SELECT customer_id, reason
            FROM delivery_skip_requests
            WHERE skip_date = ?
        `, [date]);
        const skipMap = new Map();
        for (const s of skipRows) {
            skipMap.set(s.customer_id, s.reason || 'Customer requested skip');
        }

        // 4. Group products by customer: Map<customerId, Map<productId, { subQty, addonQty, price }>>
        const customerProductMap = new Map();

        for (const s of subRows) {
            if (!customerProductMap.has(s.customer_id)) {
                customerProductMap.set(s.customer_id, new Map());
            }
            const pMap = customerProductMap.get(s.customer_id);
            pMap.set(s.product_id, {
                product_id: s.product_id,
                subscription_qty: parseFloat(s.subscription_qty) || 0,
                addon_qty: 0,
                price_per_unit: parseFloat(s.current_product_price || s.sub_price || 60)
            });
        }

        // An approved add-on for a product the customer does not subscribe to still creates an item
        for (const a of addonRows) {
            if (!customerProductMap.has(a.customer_id)) {
                customerProductMap.set(a.customer_id, new Map());
            }
            const pMap = customerProductMap.get(a.customer_id);
            if (pMap.has(a.product_id)) {
                const item = pMap.get(a.product_id);
                item.addon_qty += parseFloat(a.addon_quantity) || 0;
            } else {
                pMap.set(a.product_id, {
                    product_id: a.product_id,
                    subscription_qty: 0,
                    addon_qty: parseFloat(a.addon_quantity) || 0,
                    price_per_unit: parseFloat(a.price_per_unit || 60)
                });
            }
        }

        // 5. Fetch route assignments for these customers
        const [routeRows] = await connection.query(`
            SELECT customer_id, delivery_boy_id, stop_order
            FROM delivery_routes
        `);
        const routeMap = new Map();
        for (const r of routeRows) {
            routeMap.set(r.customer_id, r.delivery_boy_id);
        }

        let generatedCount = 0;
        let skippedCount = 0;
        let unassignedCount = 0;

        for (const [customerId, pMap] of customerProductMap.entries()) {
            const deliveryBoyId = routeMap.get(customerId) || null;
            if (!deliveryBoyId) {
                unassignedCount++;
                // Record UNASSIGNED audit entry if not already logged for today
                await connection.query(`
                    INSERT INTO audit_log (action, entity_type, entity_id, notes)
                    SELECT 'UNASSIGNED_DELIVERY', 'customer', ?, ?
                    WHERE NOT EXISTS (
                        SELECT 1 FROM audit_log 
                        WHERE action = 'UNASSIGNED_DELIVERY' 
                          AND entity_id = ? 
                          AND DATE(created_at) = ?
                    )
                `, [customerId, `Customer #${customerId} has active deliveries on ${date} but no route assigned.`, customerId, date]);
            }

            const isSkipped = skipMap.has(customerId);
            const status = isSkipped ? 'CUSTOMER_SKIPPED' : 'PENDING';
            if (isSkipped) skippedCount++;

            // Calculate total expected liters across all products
            let totalExpected = 0;
            for (const item of pMap.values()) {
                totalExpected += (item.subscription_qty + item.addon_qty);
            }

            // Insert deliveries row (or update delivery_boy_id if already PENDING)
            const [delResult] = await connection.query(`
                INSERT INTO deliveries 
                    (customer_id, delivery_boy_id, date, assigned_quantity, expected_quantity, actual_quantity, status, exception_reason)
                VALUES (?, ?, ?, ?, ?, 0, ?, ?)
                ON DUPLICATE KEY UPDATE
                    assigned_quantity = IF(status = 'PENDING', VALUES(assigned_quantity), assigned_quantity),
                    delivery_boy_id = IF(status = 'PENDING', VALUES(delivery_boy_id), delivery_boy_id),
                    expected_quantity = IF(status = 'PENDING', VALUES(expected_quantity), expected_quantity),
                    status = IF(status = 'PENDING' AND VALUES(status) = 'CUSTOMER_SKIPPED', 'CUSTOMER_SKIPPED', status),
                    exception_reason = IF(VALUES(status) = 'CUSTOMER_SKIPPED', VALUES(exception_reason), exception_reason)
            `, [
                customerId,
                deliveryBoyId,
                date,
                totalExpected,
                totalExpected,
                status,
                isSkipped ? skipMap.get(customerId) : null
            ]);

            // Get the delivery id for this customer & date
            const [[delRow]] = await connection.query(
                'SELECT id FROM deliveries WHERE customer_id = ? AND date = ?',
                [customerId, date]
            );
            const deliveryId = delRow ? delRow.id : delResult.insertId;

            // Insert / Upsert delivery_items
            for (const item of pMap.values()) {
                const expectedQty = item.subscription_qty + item.addon_qty;
                await connection.query(`
                    INSERT INTO delivery_items
                        (delivery_id, product_id, subscription_qty, addon_qty, expected_qty, actual_qty, price_per_unit)
                    VALUES (?, ?, ?, ?, ?, 0, ?)
                    ON DUPLICATE KEY UPDATE
                        subscription_qty = VALUES(subscription_qty),
                        addon_qty = VALUES(addon_qty),
                        expected_qty = VALUES(expected_qty),
                        price_per_unit = VALUES(price_per_unit)
                `, [
                    deliveryId,
                    item.product_id,
                    item.subscription_qty,
                    item.addon_qty,
                    expectedQty,
                    item.price_per_unit
                ]);
            }

            generatedCount++;
        }

        await connection.commit();
        console.log(`[DeliveryGenerator] Completed: ${generatedCount} customers processed (${skippedCount} skipped, ${unassignedCount} unassigned).`);
        return {
            generated: generatedCount,
            skipped: skippedCount,
            unassigned: unassignedCount,
            totalCustomers: customerProductMap.size,
            date
        };
    } catch (err) {
        await connection.rollback();
        console.error('[DeliveryGenerator] Error generating deliveries:', err);
        throw err;
    } finally {
        connection.release();
    }
}

module.exports = { generateForDate };
