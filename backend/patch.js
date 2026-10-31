const fs = require('fs');

const replacement = `const generateMonthlyBills = async (req, res) => {
    try {
        const { month, year } = req.query;
        if (!month || !year) return res.status(400).json({ message: 'month and year required' });

        // Get or create billing period
        const [bpRows] = await pool.query(
            'SELECT id FROM billing_periods WHERE month = ? AND year = ?',
            [month, year]
        );
        let billingPeriodId;
        if (bpRows.length === 0) {
            const [bp] = await pool.query(
                'INSERT INTO billing_periods (month, year, status) VALUES (?, ?, "OPEN")',
                [month, year]
            );
            billingPeriodId = bp.insertId;
        } else {
            billingPeriodId = bpRows[0].id;
        }

        // Get all active subscriptions for this period
        const [subscriptions] = await pool.query(\`
            SELECT DISTINCT s.customer_id, s.product_id, s.quantity_per_day, s.price_per_unit,
                   p.name as product_name
            FROM subscriptions s
            JOIN products p ON s.product_id = p.id
            WHERE s.status = 'ACTIVE'
              AND s.start_date <= LAST_DAY(STR_TO_DATE(CONCAT(?, '-', ?, '-01'), '%Y-%m-%d'))
              AND (s.end_date IS NULL OR s.end_date >= STR_TO_DATE(CONCAT(?, '-', ?, '-01'), '%Y-%m-%d'))
        \`, [year, month, year, month]);

        const customerIds = [...new Set(subscriptions.map(s => s.customer_id))];
        let generatedCount = 0;

        for (const customerId of customerIds) {
            // Get this customer's deliveries for the month
            const [deliveries] = await pool.query(\`
                SELECT d.*, s.quantity_per_day, s.price_per_unit as sub_price
                FROM deliveries d
                LEFT JOIN subscriptions s ON s.customer_id = d.customer_id
                    AND s.product_id = (SELECT product_id FROM subscriptions WHERE customer_id = d.customer_id AND status='ACTIVE' LIMIT 1)
                WHERE d.customer_id = ? AND MONTH(d.date) = ? AND YEAR(d.date) = ?
            \`, [customerId, month, year]);

            // Get this customer's add-ons for the month
            const [addons] = await pool.query(\`
                SELECT * FROM delivery_addons
                WHERE customer_id = ? AND MONTH(delivery_date) = ? AND YEAR(delivery_date) = ?
                  AND status = 'APPROVED'
            \`, [customerId, month, year]);

            // Calculate billing
            let subscriptionCharge = 0;
            let addonCharge = 0;
            let deliveredDays = 0;
            let skippedDays = 0;
            let missedDays = 0;

            // Clear old ledger entries for this customer/period
            await pool.query(
                'DELETE FROM billing_ledger WHERE billing_period_id = ? AND customer_id = ?',
                [billingPeriodId, customerId]
            );

            // SOURCE OF TRUTH HIERARCHY:
            //   Subscription -> defines expected qty per day
            //   Add-on -> adds extra qty for one specific date only
            //   Delivery Partner Record -> defines ACTUAL qty provided (actual_quantity)
            //   Billing Ledger -> billable_amount = actual_quantity x price_per_unit
            //   NOT expected_quantity. Never bill what was expected. Bill what was actually delivered.
            for (const del of deliveries) {
                const isBillable = del.status === 'DELIVERED';
                const actualQty = parseFloat(del.actual_quantity || 0);
                const pricePerUnit = parseFloat(del.sub_price || del.price_per_unit || 60);
                // CRITICAL: uses ACTUAL quantity delivered by partner, not expected quantity
                const billableAmt = isBillable ? actualQty * pricePerUnit : 0;

                if (del.status === 'DELIVERED') deliveredDays++;
                else if (del.status === 'CUSTOMER_SKIPPED') skippedDays++;
                else if (['NOT_DELIVERED', 'DELIVERY_FAILED', 'MISSED'].includes(del.status)) missedDays++;

                subscriptionCharge += billableAmt;

                await pool.query(\`
                    INSERT INTO billing_ledger
                        (billing_period_id, customer_id, delivery_id, record_date,
                         subscription_qty, addon_qty, expected_qty, actual_qty,
                         delivery_status, price_per_unit, billable_amount, is_billable)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                \`, [
                    billingPeriodId, customerId, del.id, del.date,
                    parseFloat(del.quantity_per_day || del.expected_quantity || 0),
                    parseFloat(del.addon_quantity || 0),
                    parseFloat(del.expected_quantity || 0),
                    actualQty,
                    del.status, pricePerUnit,
                    billableAmt, isBillable ? 1 : 0
                ]);
            }

            // Add addon ledger entries
            for (const addon of addons) {
                addonCharge += parseFloat(addon.total_amount);
                await pool.query(\`
                    INSERT INTO billing_ledger 
                        (billing_period_id, customer_id, addon_id, record_date,
                         subscription_qty, addon_qty, expected_qty, actual_qty,
                         delivery_status, price_per_unit, billable_amount, is_billable)
                    VALUES (?, ?, ?, ?, 0, ?, ?, ?, 'ADDON', ?, ?, 1)
                \`, [
                    billingPeriodId, customerId, addon.id, addon.delivery_date,
                    addon.addon_quantity, addon.addon_quantity, addon.addon_quantity,
                    addon.price_per_unit, addon.total_amount
                ]);
            }

            const totalAmount = subscriptionCharge + addonCharge;

            // Upsert draft bill
            await pool.query(\`
                INSERT INTO bills 
                    (billing_period_id, customer_id, month, year, total_days,
                     delivered_days, skipped_days, missed_days,
                     subscription_charge, addon_charge, amount, status,
                     generated_date, bill_type)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'DRAFT', CURDATE(), 'SUBSCRIPTION')
                ON DUPLICATE KEY UPDATE
                    total_days = VALUES(total_days),
                    delivered_days = VALUES(delivered_days),
                    skipped_days = VALUES(skipped_days),
                    missed_days = VALUES(missed_days),
                    subscription_charge = VALUES(subscription_charge),
                    addon_charge = VALUES(addon_charge),
                    amount = VALUES(amount),
                    status = 'DRAFT',
                    generated_date = CURDATE()
            \`, [
                billingPeriodId, customerId, month, year,
                deliveries.length, deliveredDays, skippedDays, missedDays,
                subscriptionCharge, addonCharge, totalAmount
            ]);
            generatedCount++;
        }

        // Audit log
        await pool.query(\`
            INSERT INTO audit_log (user_id, action, entity_type, notes)
            VALUES (?, 'BILLS_GENERATED', 'billing_period', ?)
        \`, [req.user.id, \`Generated draft bills for \${month}/\${year} — \${generatedCount} customers\`]);

        res.json({ message: \`Draft bills generated for \${generatedCount} customers\`, month, year, billingPeriodId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

`;

let c = fs.readFileSync('src/controllers/adminController.js', 'utf8');
const startIdx = c.indexOf('const generateMonthlyBills = async (req, res) => {');
const endIdx = c.indexOf('const getCustomerLedger = async (req, res) => {');

if(startIdx !== -1 && endIdx !== -1) {
    c = c.substring(0, startIdx) + replacement + c.substring(endIdx);
    fs.writeFileSync('src/controllers/adminController.js', c);
    console.log('SUCCESS');
} else {
    console.log('Could not find start/end indices');
}
