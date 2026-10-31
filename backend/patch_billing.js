const fs = require('fs');
let c = fs.readFileSync('src/controllers/adminController.js', 'utf8');

const anchor = '// Build ledger from delivery records';
const endAnchor = '// Add addon ledger entries';

if (!c.includes(anchor)) { console.log('anchor not found'); process.exit(1); }

const newBlock = `            // SOURCE OF TRUTH HIERARCHY:
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
            }`;

const idx = c.indexOf(anchor);
const endIdx = c.indexOf(endAnchor, idx);
c = c.substring(0, idx) + newBlock + '\r\n\r\n            ' + c.substring(endIdx);
fs.writeFileSync('src/controllers/adminController.js', c);
console.log('SUCCESS');
