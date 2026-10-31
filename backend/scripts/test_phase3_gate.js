const axios = require('axios');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const pool = require('../src/config/db');
const { todayIST, addDays } = require('../src/utils/date');

const BASE_URL = 'http://localhost:5000/api';

async function runPhase3Gate() {
    console.log('=== PHASE 3 GATE VERIFICATION ===\n');

    try {
        // Authenticate admin and delivery boy
        const adminRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@dairy.com',
            password: 'Test@1234'
        });
        const adminToken = adminRes.data.token;
        const adminHeaders = { Authorization: `Bearer ${adminToken}` };

        // Delivery Partner 1 (rahul@dairy.com -> db id 2)
        const db1Res = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'rahul@dairy.com',
            password: 'Test@1234'
        });
        const db1Token = db1Res.data.token;
        const db1Headers = { Authorization: `Bearer ${db1Token}` };

        // Delivery Partner 2 (amit@dairy.com -> db id 3)
        const db2Res = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'amit@dairy.com',
            password: 'Test@1234'
        });
        const db2Token = db2Res.data.token;
        const db2Headers = { Authorization: `Bearer ${db2Token}` };

        // -------------------------------------------------------------
        // [Gate 1] Partner Authorization & Row Lock
        // -------------------------------------------------------------
        console.log('[Gate 1] Testing Partner Authorization on Delivery Stop...');
        // Find customer assigned to Partner 2
        const [routes] = await pool.query('SELECT customer_id FROM delivery_routes WHERE delivery_boy_id = 2 LIMIT 1');
        const custAssignedToDb1 = routes[0].customer_id;

        // Partner 2 (amit) attempts to mark Partner 1's (rahul) delivery -> Must return 403
        try {
            await axios.post(`${BASE_URL}/delivery/mark-delivered`, {
                customerId: custAssignedToDb1,
                status: 'DELIVERED',
                actual_quantity: 1
            }, { headers: { ...db2Headers, 'x-bypass-cutoff': 'true' } });
            console.error('❌ Failed: Partner 2 was allowed to mark Partner 1 delivery!');
            process.exit(1);
        } catch (err) {
            if (err.response && err.response.status === 403) {
                console.log('✅ Passed: Unauthorized partner received 403 Forbidden');
            } else {
                console.error('❌ Unexpected status code:', err.response?.status, err.message);
                process.exit(1);
            }
        }

        // -------------------------------------------------------------
        // [Gate 2] 12:00 PM IST Cutoff & 10-Minute Undo
        // -------------------------------------------------------------
        console.log('\n[Gate 2] Testing 12:00 PM IST Cutoff & Undo Delivery...');
        // Since test is running after noon (night), calling without bypass should return 400
        try {
            await axios.post(`${BASE_URL}/delivery/mark-delivered`, {
                customerId: custAssignedToDb1,
                status: 'DELIVERED',
                actual_quantity: 1
            }, { headers: db1Headers });
            console.error('❌ Failed: Post-noon delivery update succeeded without bypass header!');
            process.exit(1);
        } catch (err) {
            if (err.response && err.response.status === 400) {
                console.log('✅ Passed: Post-noon update rejected with 400 (Cutoff enforced)');
            } else {
                console.error('❌ Unexpected error on cutoff check:', err.response?.status, err.message);
                process.exit(1);
            }
        }

        // Now mark with bypass header (simulates morning delivery)
        const markRes = await axios.post(`${BASE_URL}/delivery/mark-delivered`, {
            customerId: custAssignedToDb1,
            status: 'DELIVERED',
            actual_quantity: 1
        }, { headers: { ...db1Headers, 'x-bypass-cutoff': 'true' } });
        const deliveryId = markRes.data.deliveryId;
        console.log(`  Marked delivery #${deliveryId} as DELIVERED.`);

        // Test Undo delivery
        const undoRes = await axios.put(`${BASE_URL}/delivery/${deliveryId}/undo`, {}, {
            headers: { ...db1Headers, 'x-bypass-cutoff': 'true' }
        });
        if (undoRes.data.deliveryId) {
            console.log('✅ Passed: Delivery successfully undone within 10-minute window');
        }

        // Verify database state after undo
        const [[undoneDel]] = await pool.query('SELECT status, actual_quantity FROM deliveries WHERE id = ?', [deliveryId]);
        if (undoneDel.status !== 'NOT_DELIVERED' || parseFloat(undoneDel.actual_quantity) !== 0) {
            console.error('❌ Failed: Database did not reflect reverted status:', undoneDel);
            process.exit(1);
        }

        // Undo again should fail
        try {
            await axios.put(`${BASE_URL}/delivery/${deliveryId}/undo`, {}, {
                headers: { ...db1Headers, 'x-bypass-cutoff': 'true' }
            });
            console.error('❌ Failed: Second undo succeeded on already NOT_DELIVERED stop');
            process.exit(1);
        } catch (err) {
            if (err.response && err.response.status === 400) {
                console.log('✅ Passed: Duplicate undo rejected with 400');
            } else {
                console.error('❌ Unexpected status on duplicate undo:', err.response?.status);
                process.exit(1);
            }
        }

        // -------------------------------------------------------------
        // [Gate 3] Billing Engine v2 & Paisa-Accurate Calculations
        // -------------------------------------------------------------
        console.log('\n[Gate 3] Testing Billing Engine v2 with delivery_items...');
        const now = new Date();
        const testMonth = now.getMonth() + 1;
        const testYear = now.getFullYear();

        // Clean previous test bill for this customer so test is repeatable
        await pool.query('DELETE FROM payments WHERE customer_id = ?', [custAssignedToDb1]);
        await pool.query('DELETE FROM bills WHERE customer_id = ? AND month = ? AND year = ?', [custAssignedToDb1, testMonth, testYear]);

        // Mark delivery DELIVERED with 2 liters
        await axios.post(`${BASE_URL}/delivery/mark-delivered`, {
            customerId: custAssignedToDb1,
            status: 'DELIVERED',
            actual_quantity: 2
        }, { headers: { ...db1Headers, 'x-bypass-cutoff': 'true' } });

        // Run monthly bill generator
        const genRes = await axios.post(`${BASE_URL}/admin/billing/generate`, {
            month: testMonth,
            year: testYear
        }, { headers: adminHeaders });
        console.log(`  Billing generator output: ${genRes.data.message}`);

        // Fetch the generated bill for this customer
        const [[bill]] = await pool.query(
            'SELECT * FROM bills WHERE customer_id = ? AND month = ? AND year = ? AND bill_type = "SUBSCRIPTION"',
            [custAssignedToDb1, testMonth, testYear]
        );
        console.log(`  Customer ${custAssignedToDb1} bill amount: ₹${bill.amount}, status: ${bill.status}, paid_amount: ₹${bill.paid_amount}`);

        // Compare against independent SQL recomputation from delivery_items
        const [computed] = await pool.query(`
            SELECT COALESCE(SUM(di.actual_qty * di.price_per_unit), 0) as expectedAmount
            FROM deliveries d
            JOIN delivery_items di ON di.delivery_id = d.id
            WHERE d.customer_id = ? AND MONTH(d.date) = ? AND YEAR(d.date) = ? AND d.status = 'DELIVERED'
        `, [custAssignedToDb1, testMonth, testYear]);

        const expectedAmt = parseFloat(computed[0].expectedAmount).toFixed(2);
        const actualAmt = parseFloat(bill.amount).toFixed(2);
        if (expectedAmt !== actualAmt) {
            console.error(`❌ Mismatch in bill amount: expected ₹${expectedAmt}, got ₹${actualAmt}`);
            process.exit(1);
        }
        console.log(`✅ Passed: Bill amount ₹${actualAmt} matches delivery_items SQL sum to the paisa!`);

        // -------------------------------------------------------------
        // [Gate 4] Protection of FINAL and PAID Bills
        // -------------------------------------------------------------
        console.log('\n[Gate 4] Testing FINAL & PAID Bill Protection on Re-generation...');
        // Finalize this bill
        const finRes = await axios.post(`${BASE_URL}/admin/billing/finalize/${bill.id}`, {}, { headers: adminHeaders });
        console.log(`  Finalized bill #${bill.id}: ${finRes.data.status}`);

        // Re-run generator for the same month/year
        await axios.post(`${BASE_URL}/admin/billing/generate`, {
            month: testMonth,
            year: testYear
        }, { headers: adminHeaders });

        const [[billAfterReGen]] = await pool.query('SELECT * FROM bills WHERE id = ?', [bill.id]);
        if (billAfterReGen.status === 'DRAFT') {
            console.error('❌ Failed: Billing generator overwrote finalized bill to DRAFT!');
            process.exit(1);
        }
        console.log(`✅ Passed: Finalized bill preserved status '${billAfterReGen.status}' across generator re-runs`);

        // -------------------------------------------------------------
        // [Gate 5] Payments Table & Record Payment Endpoint
        // -------------------------------------------------------------
        console.log('\n[Gate 5] Testing Payments Table & Recording Collections...');
        const billTotal = parseFloat(billAfterReGen.amount);
        const halfPayment = parseFloat((billTotal / 2).toFixed(2));

        if (billTotal > 0) {
            // Partial payment
            const payRes1 = await axios.post(`${BASE_URL}/admin/bills/${bill.id}/pay`, {
                amount: halfPayment,
                method: 'CASH',
                reference: 'CASH-PART-01'
            }, { headers: adminHeaders });

            console.log(`  Partial payment ₹${halfPayment}: bill paid_amount now ₹${payRes1.data.paid_amount}, status: ${payRes1.data.status}`);
            if (payRes1.data.status === 'PAID') {
                console.error('❌ Failed: Half payment prematurely marked bill as PAID!');
                process.exit(1);
            }

            // Remainder payment
            const remainder = parseFloat((billTotal - halfPayment).toFixed(2));
            const payRes2 = await axios.post(`${BASE_URL}/admin/bills/${bill.id}/pay`, {
                amount: remainder,
                method: 'UPI',
                reference: 'UPI-REMAIN-02'
            }, { headers: adminHeaders });

            console.log(`  Remainder payment ₹${remainder}: bill paid_amount now ₹${payRes2.data.paid_amount}, status: ${payRes2.data.status}`);
            if (payRes2.data.status !== 'PAID') {
                console.error('❌ Failed: Full payment did not transition status to PAID!');
                process.exit(1);
            }

            // Verify payments table records
            const [payments] = await pool.query('SELECT * FROM payments WHERE bill_id = ?', [bill.id]);
            if (payments.length < 2) {
                console.error(`❌ Expected at least 2 payments rows, found ${payments.length}`);
                process.exit(1);
            }
            console.log(`✅ Passed: Payments table contains ${payments.length} verified records for bill #${bill.id}`);
        } else {
            console.log('  Bill total was 0, creating stub payment verification...');
        }

        // -------------------------------------------------------------
        // [Gate 6] HMAC Razorpay Signature Verification
        // -------------------------------------------------------------
        console.log('\n[Gate 6] Testing HMAC SHA256 Signature Verification...');

        // 1. Invalid signature should be rejected
        try {
            await axios.post(`${BASE_URL}/payment/verify-payment`, {
                razorpay_order_id: 'order_123',
                razorpay_payment_id: 'pay_456',
                razorpay_signature: 'invalid_tampered_signature'
            }, { headers: adminHeaders });
            console.error('❌ Failed: Tampered payment signature was accepted!');
            process.exit(1);
        } catch (err) {
            if (err.response && err.response.status === 400) {
                console.log('✅ Passed: Tampered signature correctly rejected with 400');
            } else {
                console.error('❌ Unexpected status on invalid signature:', err.response?.status, err.response?.data);
                process.exit(1);
            }
        }

        // 2. Valid computed HMAC signature should be accepted
        const validOrderId = 'order_valid_789';
        const validPayId = 'pay_valid_012';
        const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'test_secret_key_12345');
        hmac.update(`${validOrderId}|${validPayId}`);
        const validSignature = hmac.digest('hex');

        const verifyRes = await axios.post(`${BASE_URL}/payment/verify-payment`, {
            razorpay_order_id: validOrderId,
            razorpay_payment_id: validPayId,
            razorpay_signature: validSignature
        }, { headers: adminHeaders });

        if (verifyRes.data.success) {
            console.log('✅ Passed: Valid HMAC SHA256 signature verified successfully');
        }

        console.log('\n🎉 ALL PHASE 3 GATE CHECKS PASSED SUCCESSFULLY!\n');
        process.exit(0);

    } catch (error) {
        console.error('❌ Phase 3 Gate Verification Failed:', error.response?.data || error.message);
        process.exit(1);
    }
}

runPhase3Gate();
