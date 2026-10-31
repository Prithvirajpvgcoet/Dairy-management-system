const { todayIST, addDays } = require('../utils/date');
const pool = require('../config/db');
const { notifyAdminAndDeliveryBoy } = require('../services/notificationService');
const bcrypt = require('bcryptjs');

const getDashboard = async (req, res) => {
    try {
        const [[{ totalCustomers }]] = await pool.query('SELECT COUNT(*) as totalCustomers FROM customers');
        const [[{ totalDeliveryBoys }]] = await pool.query('SELECT COUNT(*) as totalDeliveryBoys FROM delivery_boys');
        const [[{ todayMilk }]] = await pool.query(`SELECT COALESCE(SUM(delivered_quantity),0) as todayMilk FROM deliveries WHERE date = CURDATE()`);
        const [[{ delivered }]] = await pool.query(`SELECT COUNT(*) as delivered FROM deliveries WHERE date = CURDATE() AND status='DELIVERED'`);
        const [[{ pendingDeliveries }]] = await pool.query(`SELECT COUNT(*) as pendingDeliveries FROM deliveries WHERE date = CURDATE() AND status='PENDING'`);
        const [[{ totalRevenue }]] = await pool.query(`SELECT COALESCE(SUM(amount), 0) as totalRevenue FROM bills WHERE status='PAID'`);
        const [[{ totalOrders }]] = await pool.query(`SELECT COUNT(*) as totalOrders FROM bills`);

        const [ordersByStatusRows] = await pool.query(`SELECT status, COUNT(*) as count FROM deliveries GROUP BY status`);
        const ordersByStatus = { DELIVERED: 0, PENDING: 0, MISSED: 0 };
        ordersByStatusRows.forEach(r => { ordersByStatus[r.status] = parseInt(r.count); });

        const [topProducts] = await pool.query(`
            SELECT p.name, p.unit, COALESCE(SUM(d.delivered_quantity), 0) as sold
            FROM products p
            LEFT JOIN customer_requirements cr ON cr.product_id = p.id
            LEFT JOIN deliveries d ON d.customer_id = cr.customer_id AND d.status = 'DELIVERED'
            GROUP BY p.id, p.name, p.unit
            ORDER BY sold DESC
            LIMIT 5
        `);

        const [recentOrders] = await pool.query(`
            SELECT b.id, b.amount, b.status, b.month, b.year, b.bill_type, b.generated_date,
                   u.name as customer_name, u.phone
            FROM bills b
            JOIN customers c ON b.customer_id = c.id
            JOIN users u ON c.user_id = u.id
            ORDER BY b.id DESC
            LIMIT 5
        `);

        const [recentActivity] = await pool.query(`
            SELECT 
                CONCAT(u.name, ' - delivery ', d.status) as text,
                d.date as created_at,
                d.status
            FROM deliveries d
            JOIN customers c ON d.customer_id = c.id
            JOIN users u ON c.user_id = u.id
            ORDER BY d.id DESC
            LIMIT 6
        `);

        const [[{ activeToday }]] = await pool.query(`SELECT COUNT(DISTINCT delivery_boy_id) as activeToday FROM deliveries WHERE date = CURDATE()`);
        const [[{ onDelivery }]] = await pool.query(`SELECT COUNT(DISTINCT delivery_boy_id) as onDelivery FROM deliveries WHERE date = CURDATE() AND status='PENDING'`);

        const [weeklyRevenue] = await pool.query(`
            SELECT DATE(b.generated_date) as date, COALESCE(SUM(b.amount),0) as revenue
            FROM bills b
            WHERE b.generated_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            GROUP BY DATE(b.generated_date)
            ORDER BY date ASC
        `);

        res.json({
            customers: totalCustomers,
            deliveryBoys: totalDeliveryBoys,
            todayMilk,
            delivered,
            pendingDeliveries,
            totalRevenue: parseFloat(totalRevenue),
            totalOrders,
            ordersByStatus,
            topProducts,
            recentOrders,
            recentActivity,
            deliveryPartnerStats: {
                total: totalDeliveryBoys,
                active: activeToday,
                onDelivery,
                offline: Math.max(0, totalDeliveryBoys - activeToday)
            },
            weeklyRevenue
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || error.toString() });
    }
};

const addCustomer = async (req, res) => {
    try {
        const { name, phone, email, password, address } = req.body;
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Insert User
            const [userResult] = await connection.query(
                'INSERT INTO users (name, phone, email, password, role) VALUES (?, ?, ?, ?, "CUSTOMER")',
                [name, phone, email, hashedPassword]
            );

            // Insert Customer linked to User
            const userId = userResult.insertId;
            const [customerResult] = await connection.query(
                'INSERT INTO customers (user_id, address) VALUES (?, ?)',
                [userId, address]
            );

            const customerId = customerResult.insertId;

            // Default requirement of 1L Cow Milk
            await connection.query(
                'INSERT INTO customer_requirements (customer_id, product_id, quantity) VALUES (?, 1, 1)',
                [customerId]
            );

            await connection.commit();
            res.status(201).json({ message: 'Customer added successfully' });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || error.toString() });
    }
};

const assignRoute = async (req, res) => {
    try {
        const { customerId, deliveryBoyId } = req.body;
        if (deliveryBoyId === null) {
            await pool.query('DELETE FROM delivery_routes WHERE customer_id = ?', [customerId]);
            return res.json({ message: 'Route unassigned successfully' });
        }
        // Check if route already exists
        const [existing] = await pool.query('SELECT * FROM delivery_routes WHERE customer_id = ?', [customerId]);
        
        if (existing.length > 0) {
            await pool.query('UPDATE delivery_routes SET delivery_boy_id = ? WHERE customer_id = ?', [deliveryBoyId, customerId]);
        } else {
            await pool.query('INSERT INTO delivery_routes (customer_id, delivery_boy_id) VALUES (?, ?)', [customerId, deliveryBoyId]);
        }
        res.json({ message: 'Route assigned successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || error.toString() });
    }
};

const getDailyLogs = async (req, res) => {
    try {
        const date = req.query.date || todayIST();
        
        const [logs] = await pool.query(`
            SELECT 
                d.id,
                cu.name as customer_name,
                (SELECT GROUP_CONCAT(CONCAT(cr.quantity, ' ', p.unit, ' ', p.name) SEPARATOR ', ')
                 FROM customer_requirements cr 
                 JOIN products p ON cr.product_id = p.id 
                 WHERE cr.customer_id = c.id) as aggregated_requirements,
                du.name as delivery_boy_name,
                d.status,
                d.delivered_quantity
            FROM deliveries d
            JOIN customers c ON d.customer_id = c.id
            JOIN users cu ON c.user_id = cu.id
            JOIN delivery_boys db ON d.delivery_boy_id = db.id
            JOIN users du ON db.user_id = du.id
            WHERE d.date = ?
        `, [date]);
        
        res.json(logs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || error.toString() });
    }
};

const generateBills = async (req, res) => {
    try {
        const { month, year } = req.body; // month is "January"
        const monthMap = { 'January': '01', 'February': '02', 'March': '03', 'April': '04', 'May': '05', 'June': '06', 'July': '07', 'August': '08', 'September': '09', 'October': '10', 'November': '11', 'December': '12' };
        const monthNum = monthMap[month];
        
        if (!monthNum) return res.status(400).json({ message: 'Invalid month format' });
        
        const [deliveries] = await pool.query(`
            SELECT 
                d.customer_id, 
                SUM(d.delivered_quantity) as total_liters, 
                COUNT(d.id) as delivery_days,
                (
                    SELECT SUM(cr.quantity * p.price_per_unit)
                    FROM customer_requirements cr
                    JOIN products p ON cr.product_id = p.id
                    WHERE cr.customer_id = d.customer_id
                ) as daily_cost
            FROM deliveries d
            WHERE d.status = 'DELIVERED' 
            AND d.date LIKE ?
            GROUP BY d.customer_id
        `, [`${year}-${monthNum}-%`]);
        
        if (deliveries.length === 0) {
            return res.json({ message: 'No deliveries found for this month' });
        }

        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            for (let del of deliveries) {
                const amount = del.daily_cost * del.delivery_days;
                const [existingBill] = await connection.query(`
                    SELECT id FROM bills WHERE customer_id = ? AND month = ? AND year = ?
                `, [del.customer_id, monthNum, year]);
                
                if (existingBill.length > 0) {
                    await connection.query(`
                        UPDATE bills SET total_liters = ?, amount = ?, generated_date = CURDATE()
                        WHERE id = ?
                    `, [del.total_liters, amount, existingBill[0].id]);
                } else {
                    await connection.query(`
                        INSERT INTO bills (customer_id, month, year, total_liters, amount, generated_date, status, bill_type)
                        VALUES (?, ?, ?, ?, ?, CURDATE(), 'PENDING', 'SUBSCRIPTION')
                    `, [del.customer_id, monthNum, year, del.total_liters, amount]);
                }
            }
            await connection.commit();
            res.json({ message: 'Bills generated successfully' });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || error.toString() });
    }
};

const getMonthlyBilling = async (req, res) => {
    try {
        const month = req.query.month || req.body?.month; const year = req.query.year || req.body?.year; // month is e.g. "January"
        const monthMap = { 'January': '01', 'February': '02', 'March': '03', 'April': '04', 'May': '05', 'June': '06', 'July': '07', 'August': '08', 'September': '09', 'October': '10', 'November': '11', 'December': '12' };
        const monthNum = monthMap[month];

        if (!monthNum) return res.status(400).json({ message: 'Invalid month format' });
        
        const [bills] = await pool.query(`
            SELECT 
                b.id,
                b.month,
                b.year,
                b.total_liters,
                b.amount,
                b.status,
                u.name as customer_name,
                u.phone
            FROM bills b
            JOIN customers c ON b.customer_id = c.id
            JOIN users u ON c.user_id = u.id
            WHERE b.month = ? AND b.year = ?
        `, [monthNum, year]);
        
        res.json(bills);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || error.toString() });
    }
};

const getDeliveryBoys = async (req, res) => {
    try {
        const [boys] = await pool.query(`
            SELECT db.id, u.name, u.phone, u.email, db.salary_type, db.salary_rate
            FROM delivery_boys db
            JOIN users u ON db.user_id = u.id
        `);
        res.json(boys);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || error.toString() });
    }
};

const addDeliveryBoy = async (req, res) => {
    try {
        const { name, phone, email, password, salary_type, salary_rate } = req.body;
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Insert User
            const [userResult] = await connection.query(
                'INSERT INTO users (name, phone, email, password, role) VALUES (?, ?, ?, ?, "DELIVERY_BOY")',
                [name, phone, email, hashedPassword]
            );

            // Insert into delivery_boys
            const userId = userResult.insertId;
            await connection.query(
                'INSERT INTO delivery_boys (user_id, joining_date, salary_type, salary_rate) VALUES (?, CURDATE(), ?, ?)',
                [userId, salary_type || 'FIXED', salary_rate || 5000.00]
            );

            await connection.commit();
            res.status(201).json({ message: 'Delivery Boy added successfully' });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || error.toString() });
    }
};

const getCustomers = async (req, res) => {
    try {
        const [customers] = await pool.query(`
            SELECT 
                c.id, u.name, c.address, 
                (SELECT GROUP_CONCAT(CONCAT(cr.quantity, ' ', p.unit, ' ', p.name) SEPARATOR ', ')
                 FROM customer_requirements cr 
                 JOIN products p ON cr.product_id = p.id 
                 WHERE cr.customer_id = c.id) as aggregated_requirements,
                (SELECT db.id FROM delivery_routes dr JOIN delivery_boys db ON dr.delivery_boy_id = db.id WHERE dr.customer_id = c.id LIMIT 1) as assigned_boy_id,
                (SELECT u2.name FROM delivery_routes dr JOIN delivery_boys db ON dr.delivery_boy_id = db.id JOIN users u2 ON db.user_id = u2.id WHERE dr.customer_id = c.id LIMIT 1) as assigned_boy_name
            FROM customers c
            JOIN users u ON c.user_id = u.id
        `);
        res.json(customers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || error.toString() });
    }
};

const getDailyDeliveryReport = async (req, res) => {
    try {
        const { date, delivery_boy_id } = req.query;
        const targetDate = date || todayIST();
        
        let query = `
            SELECT 
                d.id, d.date, d.status, d.expected_quantity, d.actual_quantity,
                d.addon_quantity, d.skip_reason, d.exception_reason,
                d.gps_latitude, d.gps_longitude, d.delivery_timestamp,
                u.name as customer_name, c.address,
                ub.name as delivery_boy_name
            FROM deliveries d
            JOIN customers c ON d.customer_id = c.id
            JOIN users u ON c.user_id = u.id
            JOIN delivery_boys db ON d.delivery_boy_id = db.id
            JOIN users ub ON db.user_id = ub.id
            WHERE d.date = ?
        `;
        const params = [targetDate];
        if (delivery_boy_id) {
            query += ' AND d.delivery_boy_id = ?';
            params.push(delivery_boy_id);
        }
        query += ' ORDER BY d.delivery_boy_id, u.name';
        
        const [rows] = await pool.query(query, params);
        
        const summary = {
            date: targetDate,
            total: rows.length,
            delivered: rows.filter(r => r.status === 'DELIVERED').length,
            skipped: rows.filter(r => r.status === 'CUSTOMER_SKIPPED').length,
            not_delivered: rows.filter(r => r.status === 'NOT_DELIVERED').length,
            pending: rows.filter(r => r.status === 'PENDING').length,
            failed: rows.filter(r => r.status === 'DELIVERY_FAILED').length,
        };
        
        res.json({ summary, deliveries: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || error.toString() });
    }
};

const generateMonthlyBills = async (req, res) => {
    try {
        const rawMonth = req.query.month || req.body?.month;
        const rawYear = req.query.year || req.body?.year;
        if (!rawMonth || !rawYear) return res.status(400).json({ message: 'month and year required' });

        const month = parseInt(rawMonth, 10);
        const year = parseInt(rawYear, 10);

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

        // Get all active subscriptions for this period or any deliveries that took place in this month
        const [subscriptions] = await pool.query(`
            SELECT DISTINCT s.customer_id
            FROM subscriptions s
            WHERE s.start_date <= LAST_DAY(STR_TO_DATE(CONCAT(?, '-', LPAD(?, 2, '0'), '-01'), '%Y-%m-%d'))
              AND (s.end_date IS NULL OR s.end_date >= STR_TO_DATE(CONCAT(?, '-', LPAD(?, 2, '0'), '-01'), '%Y-%m-%d'))
        `, [year, month, year, month]);

        const [deliveryCusts] = await pool.query(`
            SELECT DISTINCT customer_id FROM deliveries 
            WHERE MONTH(date) = ? AND YEAR(date) = ?
        `, [month, year]);

        const customerIds = [...new Set([...subscriptions.map(s => s.customer_id), ...deliveryCusts.map(d => d.customer_id)])];
        let generatedCount = 0;
        let skippedFinalCount = 0;

        for (const customerId of customerIds) {
            // Check if customer already has a FINAL or PAID bill for this month/year — DO NOT OVERWRITE
            const [[existingBill]] = await pool.query(`
                SELECT id, status FROM bills 
                WHERE customer_id = ? AND month = ? AND year = ? AND bill_type = 'SUBSCRIPTION'
            `, [customerId, month, year]);

            if (existingBill && (existingBill.status === 'FINAL' || existingBill.status === 'PAID')) {
                skippedFinalCount++;
                continue;
            }

            // Fetch all delivery_items for this customer in this month joined with deliveries
            const [items] = await pool.query(`
                SELECT 
                    d.id as delivery_id,
                    d.date as delivery_date,
                    d.status as delivery_status,
                    d.actual_quantity as delivery_actual_qty,
                    di.id as item_id,
                    di.product_id,
                    COALESCE(di.subscription_qty, d.expected_quantity, 0) as subscription_qty,
                    COALESCE(di.price_per_unit, (SELECT price_per_unit FROM subscriptions WHERE customer_id = d.customer_id AND status = 'ACTIVE' LIMIT 1), 60) as price_per_unit,
                    COALESCE(di.actual_qty, (CASE WHEN d.status = 'DELIVERED' THEN d.actual_quantity ELSE 0 END)) as actual_qty
                FROM deliveries d
                LEFT JOIN delivery_items di ON di.delivery_id = d.id
                WHERE d.customer_id = ? AND MONTH(d.date) = ? AND YEAR(d.date) = ?
                ORDER BY d.date ASC
            `, [customerId, month, year]);

            // Calculate billing metrics
            let subscriptionCharge = 0;
            let addonCharge = 0;
            let totalLiters = 0;
            const datesDelivered = new Set();
            const datesSkipped = new Set();
            const datesMissed = new Set();
            const allDeliveryDates = new Set();

            for (const it of items) {
                const dateStr = typeof it.delivery_date === 'string' ? it.delivery_date.slice(0, 10) : new Date(it.delivery_date).toISOString().slice(0, 10);
                allDeliveryDates.add(dateStr);

                if (it.delivery_status === 'DELIVERED') {
                    datesDelivered.add(dateStr);
                    const actualQty = parseFloat(it.actual_qty || 0);
                    const subQty = parseFloat(it.subscription_qty || 0);
                    const price = parseFloat(it.price_per_unit || 60);

                    const baseQty = Math.min(actualQty, subQty);
                    const extraQty = Math.max(0, actualQty - subQty);

                    subscriptionCharge += baseQty * price;
                    addonCharge += extraQty * price;
                    totalLiters += actualQty;
                } else if (it.delivery_status === 'CUSTOMER_SKIPPED') {
                    datesSkipped.add(dateStr);
                } else if (['NOT_DELIVERED', 'DELIVERY_FAILED', 'MISSED'].includes(it.delivery_status)) {
                    datesMissed.add(dateStr);
                }
            }

            const totalAmount = parseFloat((subscriptionCharge + addonCharge).toFixed(2));
            const totalDays = allDeliveryDates.size;
            const deliveredDays = datesDelivered.size;
            const skippedDays = datesSkipped.size;
            const missedDays = datesMissed.size;

            // Clear old ledger entries for this customer/period
            await pool.query(
                'DELETE FROM billing_ledger WHERE billing_period_id = ? AND customer_id = ?',
                [billingPeriodId, customerId]
            );

            // Populate ledger
            for (const it of items) {
                const isBillable = it.delivery_status === 'DELIVERED';
                const actualQty = parseFloat(it.actual_qty || 0);
                const price = parseFloat(it.price_per_unit || 60);
                const billableAmt = isBillable ? actualQty * price : 0;

                await pool.query(`
                    INSERT INTO billing_ledger
                        (billing_period_id, customer_id, delivery_id, record_date,
                         subscription_qty, addon_qty, expected_qty, actual_qty,
                         delivery_status, price_per_unit, billable_amount, is_billable)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    billingPeriodId, customerId, it.delivery_id, it.delivery_date,
                    parseFloat(it.subscription_qty || 0),
                    Math.max(0, actualQty - parseFloat(it.subscription_qty || 0)),
                    parseFloat(it.subscription_qty || 0),
                    actualQty,
                    it.delivery_status, price,
                    billableAmt, isBillable ? 1 : 0
                ]);
            }

            // Upsert draft bill (status = 'DRAFT', never overwrites FINAL or PAID)
            await pool.query(`
                INSERT INTO bills 
                    (billing_period_id, customer_id, month, year, total_days,
                     delivered_days, skipped_days, missed_days, total_liters,
                     subscription_charge, addon_charge, amount, paid_amount, status,
                     generated_date, bill_type)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0.00, 'DRAFT', CURDATE(), 'SUBSCRIPTION')
                ON DUPLICATE KEY UPDATE
                    total_days = IF(status = 'DRAFT', VALUES(total_days), total_days),
                    delivered_days = IF(status = 'DRAFT', VALUES(delivered_days), delivered_days),
                    skipped_days = IF(status = 'DRAFT', VALUES(skipped_days), skipped_days),
                    missed_days = IF(status = 'DRAFT', VALUES(missed_days), missed_days),
                    total_liters = IF(status = 'DRAFT', VALUES(total_liters), total_liters),
                    subscription_charge = IF(status = 'DRAFT', VALUES(subscription_charge), subscription_charge),
                    addon_charge = IF(status = 'DRAFT', VALUES(addon_charge), addon_charge),
                    amount = IF(status = 'DRAFT', VALUES(amount), amount),
                    generated_date = IF(status = 'DRAFT', CURDATE(), generated_date)
            `, [
                billingPeriodId, customerId, month, year,
                totalDays, deliveredDays, skippedDays, missedDays, totalLiters,
                subscriptionCharge, addonCharge, totalAmount
            ]);

            generatedCount++;
        }

        // Audit log
        await pool.query(`
            INSERT INTO audit_log (user_id, action, entity_type, notes)
            VALUES (?, 'BILLS_GENERATED', 'billing_period', ?)
        `, [req.user.id, `Generated draft bills for ${month}/${year} — ${generatedCount} customers (${skippedFinalCount} final/paid bills skipped)`]);

        res.json({ message: `Draft bills generated for ${generatedCount} customers`, month, year, billingPeriodId, skippedFinal: skippedFinalCount });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || error.toString() });
    }
};

const getCustomerLedger = async (req, res) => {
    try {
        const { customer_id } = req.params;
        const month = req.query.month || req.body?.month; const year = req.query.year || req.body?.year;
        
        const [ledger] = await pool.query(`
            SELECT bl.*, d.delivery_timestamp, d.gps_latitude, d.gps_longitude
            FROM billing_ledger bl
            LEFT JOIN deliveries d ON bl.delivery_id = d.id
            JOIN billing_periods bp ON bl.billing_period_id = bp.id
            WHERE bl.customer_id = ? AND bp.month = ? AND bp.year = ?
            ORDER BY bl.record_date ASC
        `, [customer_id, month, year]);
        
        const [bill] = await pool.query(
            'SELECT * FROM bills WHERE customer_id = ? AND month = ? AND year = ?',
            [customer_id, month, year]
        );
        
        const totals = {
            totalBillable: ledger.reduce((s, r) => s + parseFloat(r.billable_amount || 0), 0),
            deliveredDays: ledger.filter(r => r.delivery_status === 'DELIVERED').length,
            skippedDays: ledger.filter(r => r.delivery_status === 'CUSTOMER_SKIPPED').length,
            addonRows: ledger.filter(r => r.delivery_status === 'ADDON').length,
        };
        
        res.json({ ledger, bill: bill[0] || null, totals });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || error.toString() });
    }
};


const finalizeBill = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { bill_id } = req.params;
        
        const [bills] = await connection.query('SELECT * FROM bills WHERE id = ? FOR UPDATE', [bill_id]);
        if (bills.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Bill not found' });
        }
        const bill = bills[0];
        if (bill.status === 'FINAL' || bill.status === 'PAID') {
            await connection.rollback();
            return res.status(400).json({ message: 'Bill already finalized' });
        }
        
        // Fetch customer wallet balance with row lock
        const [[customer]] = await connection.query('SELECT wallet_balance FROM customers WHERE id = ? FOR UPDATE', [bill.customer_id]);
        if (!customer) {
            await connection.rollback();
            return res.status(404).json({ message: 'Customer not found' });
        }

        let walletBalance = parseFloat(customer.wallet_balance || 0);
        let billAmount = parseFloat(bill.amount);
        let currentPaid = parseFloat(bill.paid_amount || 0);
        let remainingDue = Math.max(0, billAmount - currentPaid);
        let amountDeductedFromWallet = 0;
        
        if (walletBalance > 0 && remainingDue > 0) {
            amountDeductedFromWallet = Math.min(walletBalance, remainingDue);
            walletBalance -= amountDeductedFromWallet;
            currentPaid += amountDeductedFromWallet;
            
            // Deduct from wallet
            await connection.query('UPDATE customers SET wallet_balance = ? WHERE id = ?', [walletBalance, bill.customer_id]);
            await connection.query(`
                INSERT INTO wallet_transactions (customer_id, type, amount, description, reference_id, reference_type, balance_after, created_by)
                VALUES (?, 'DEBIT', ?, ?, ?, 'BILL', ?, ?)
            `, [bill.customer_id, amountDeductedFromWallet, `Auto-deducted for Bill #${bill_id} (${bill.month}/${bill.year})`, bill_id, walletBalance, req.user.id]);

            // Record in payments table
            await connection.query(`
                INSERT INTO payments (bill_id, customer_id, amount, method, reference, collected_by, status)
                VALUES (?, ?, ?, 'WALLET', ?, ?, 'CONFIRMED')
            `, [bill_id, bill.customer_id, amountDeductedFromWallet, `Auto-deducted from wallet for Bill #${bill_id}`, req.user.id]);
        }
        
        const isFullyPaid = currentPaid >= billAmount;
        const finalStatus = isFullyPaid ? 'PAID' : 'FINAL';

        await connection.query(`
            UPDATE bills 
            SET status = ?, paid_amount = ?, finalized_at = NOW(), finalized_by = ?, paid_at = IF(? >= amount, NOW(), paid_at)
            WHERE id = ?
        `, [finalStatus, currentPaid, req.user.id, currentPaid, bill_id]);
        
        await connection.query(`
            INSERT INTO audit_log (user_id, action, entity_type, entity_id, old_value, new_value, notes)
            VALUES (?, 'BILL_FINALIZED', 'bill', ?, ?, ?, ?)
        `, [
            req.user.id, bill_id,
            JSON.stringify({ status: bill.status, paid_amount: bill.paid_amount }),
            JSON.stringify({ status: finalStatus, paid_amount: currentPaid }),
            `Bill finalized by admin for customer ${bill.customer_id} - ${bill.month}/${bill.year}`
        ]);
        
        await connection.commit();
        res.json({ 
            message: 'Bill finalized' + (finalStatus === 'PAID' ? ' and auto-paid from wallet' : ''),
            bill_id,
            status: finalStatus,
            paid_amount: currentPaid,
            amount: billAmount
        });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: error.message || error.toString() });
    } finally {
        connection.release();
    }
};

const recordBillPayment = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { id } = req.params;
        const { amount, method = 'CASH', reference } = req.body;
        const payAmount = parseFloat(amount);

        if (!payAmount || payAmount <= 0) {
            connection.release();
            return res.status(400).json({ message: 'Valid payment amount is required' });
        }

        await connection.beginTransaction();

        const [bills] = await connection.query('SELECT * FROM bills WHERE id = ? FOR UPDATE', [id]);
        if (bills.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Bill not found' });
        }
        const bill = bills[0];

        // Insert into payments table
        await connection.query(`
            INSERT INTO payments (bill_id, customer_id, amount, method, reference, collected_by, status)
            VALUES (?, ?, ?, ?, ?, ?, 'CONFIRMED')
        `, [id, bill.customer_id, payAmount, method, reference || null, req.user.id]);

        const currentPaid = parseFloat(bill.paid_amount || 0);
        const newPaidAmount = currentPaid + payAmount;
        const billAmount = parseFloat(bill.amount);
        const isFullyPaid = newPaidAmount >= billAmount;
        const newStatus = isFullyPaid ? 'PAID' : (bill.status === 'DRAFT' ? 'FINAL' : bill.status);

        await connection.query(`
            UPDATE bills 
            SET paid_amount = ?, status = ?, paid_at = IF(? >= amount, NOW(), paid_at)
            WHERE id = ?
        `, [newPaidAmount, newStatus, newPaidAmount, id]);

        await connection.query(`
            INSERT INTO audit_log (user_id, action, entity_type, entity_id, old_value, new_value, notes)
            VALUES (?, 'PAYMENT_RECORDED', 'bill', ?, ?, ?, ?)
        `, [
            req.user.id, id,
            JSON.stringify({ paid_amount: currentPaid, status: bill.status }),
            JSON.stringify({ paid_amount: newPaidAmount, status: newStatus, payment: payAmount, method }),
            `Payment of ₹${payAmount} via ${method} recorded for Bill #${id}`
        ]);

        await connection.commit();
        res.json({
            message: 'Payment recorded successfully',
            bill_id: id,
            paid_amount: newPaidAmount,
            amount: billAmount,
            status: newStatus
        });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: error.message || error.toString() });
    } finally {
        connection.release();
    }
};

const getBillingOverview = async (req, res) => {
    try {
        const month = req.query.month || req.body?.month; const year = req.query.year || req.body?.year;
        
        const [bills] = await pool.query(`
            SELECT b.*, u.name as customer_name, u.phone
            FROM bills b
            JOIN customers c ON b.customer_id = c.id
            JOIN users u ON c.user_id = u.id
            WHERE b.month = ? AND b.year = ?
            ORDER BY b.status, u.name
        `, [month, year]);
        
        const summary = {
            total: bills.length,
            draft: bills.filter(b => b.status === 'DRAFT').length,
            final: bills.filter(b => b.status === 'FINAL').length,
            paid: bills.filter(b => b.status === 'PAID').length,
            totalAmount: bills.reduce((s, b) => s + parseFloat(b.amount || 0), 0),
            paidAmount: bills.filter(b => b.status === 'PAID').reduce((s, b) => s + parseFloat(b.amount || 0), 0),
        };
        
        res.json({ summary, bills });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || error.toString() });
    }
};


// ----------------------------------------------------
// EXCEPTIONS & ADDONS (MANUAL ADMIN OVERRIDES)
// ----------------------------------------------------

const getUpcomingExceptions = async (req, res) => {
    try {
        const [skips] = await pool.query(`
            SELECT s.id, s.skip_date as date, 'SKIP' as type, s.reason, s.status, s.created_at,
                   u.name as customer_name, u.phone as customer_phone
            FROM delivery_skip_requests s
            JOIN customers c ON s.customer_id = c.id
            JOIN users u ON c.user_id = u.id
            WHERE s.skip_date >= CURDATE()
            ORDER BY s.skip_date ASC
        `);
        
        const [addons] = await pool.query(`
            SELECT a.id, a.delivery_date as date, 'ADDON' as type, a.addon_quantity as quantity, a.status, a.created_at,
                   u.name as customer_name, u.phone as customer_phone, p.name as product_name
            FROM delivery_addons a
            JOIN customers c ON a.customer_id = c.id
            JOIN users u ON c.user_id = u.id
            JOIN products p ON a.product_id = p.id
            WHERE a.delivery_date >= CURDATE()
            ORDER BY a.delivery_date ASC
        `);

        res.json([...skips, ...addons].sort((a, b) => new Date(a.date) - new Date(b.date)));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const addManualException = async (req, res) => {
    try {
        const { customer_id, type, date, reason, product_id, quantity } = req.body;
        
        if (!customer_id || !type || !date) return res.status(400).json({ message: 'Missing fields' });

        if (type === 'SKIP') {
            await pool.query(
                `INSERT IGNORE INTO delivery_skip_requests (customer_id, skip_date, reason, status) VALUES (?, ?, ?, 'APPROVED')`,
                [customer_id, date, reason || 'Admin Manual Override']
            );
            
            // Mark pending deliveries as skipped
            await pool.query(
                `UPDATE deliveries SET status = 'CUSTOMER_SKIPPED' WHERE customer_id = ? AND date = ? AND status = 'PENDING'`,
                [customer_id, date]
            );
            
            await notifyAdminAndDeliveryBoy(customer_id, 'Delivery Skipped', `Admin manually skipped delivery for ${date}`);
        } else if (type === 'ADDON') {
            if (!product_id || !quantity) return res.status(400).json({ message: 'Product and quantity required for addon' });
            
            const [[product]] = await pool.query('SELECT price_per_unit FROM products WHERE id = ?', [product_id]);
            if (!product) return res.status(404).json({ message: 'Product not found' });
            
            const totalAmount = product.price_per_unit * quantity;
            
            await pool.query(
                `INSERT INTO delivery_addons (customer_id, product_id, delivery_date, addon_quantity, price_per_unit, total_amount, status, created_by)
                 VALUES (?, ?, ?, ?, ?, ?, 'APPROVED', ?)`,
                [customer_id, product_id, date, quantity, product.price_per_unit, totalAmount, req.user.id]
            );
            
            await notifyAdminAndDeliveryBoy(customer_id, 'Extra Add-on Requested', `Admin manually added +${quantity} add-on for ${date}`);
        }
        
        res.status(201).json({ message: 'Exception recorded successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getTomorrowRoutesSummary = async (req, res) => {
    try {
        // Find tomorrow's date
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = addDays(todayIST(), 1);

        // We want to list all delivery boys and see how many of their assigned customers have skips/addons tomorrow.
        const [routes] = await pool.query(`
            SELECT 
                db.id as delivery_boy_id, 
                u.name as delivery_boy_name,
                COUNT(DISTINCT c.id) as total_customers,
                COUNT(DISTINCT s.id) as skipped_customers,
                COUNT(DISTINCT a.id) as addon_customers
            FROM delivery_boys db
            JOIN users u ON db.user_id = u.id
            JOIN delivery_routes dr ON dr.delivery_boy_id = db.id
            JOIN customers c ON c.id = dr.customer_id
            LEFT JOIN delivery_skip_requests s ON s.customer_id = c.id AND s.skip_date = ? AND s.status = 'APPROVED'
            LEFT JOIN delivery_addons a ON a.customer_id = c.id AND a.delivery_date = ? AND a.status = 'APPROVED'
            GROUP BY db.id, u.name
        `, [tomorrowStr, tomorrowStr]);

        res.json({ date: tomorrowStr, routes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


const getQuantityChangeRequests = async (req, res) => {
  try {
    const [requests] = await pool.query(`
      SELECT q.*, u.name as customer_name, p.name as product_name
      FROM quantity_change_requests q
      JOIN customers c ON q.customer_id = c.id
      JOIN users u ON c.user_id = u.id
      JOIN products p ON q.product_id = p.id
      WHERE q.status = 'PENDING'
      ORDER BY q.created_at DESC
    `);
    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const handleQuantityChangeRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, admin_note } = req.body; // action: 'APPROVE' or 'REJECT'
    
    const [[request]] = await pool.query('SELECT * FROM quantity_change_requests WHERE id = ?', [id]);
    if (!request || request.status !== 'PENDING') return res.status(404).json({ message: 'Request not found or already processed' });
    
    if (action === 'APPROVE') {
      await pool.query('UPDATE quantity_change_requests SET status = "APPROVED", admin_note = ? WHERE id = ?', [admin_note || '', id]);
      
      // Update subscription
      const [subs] = await pool.query('SELECT id FROM subscriptions WHERE customer_id = ? AND product_id = ? AND status = "ACTIVE"', [request.customer_id, request.product_id]);
      if (subs.length > 0) {
        await pool.query('UPDATE subscriptions SET quantity_per_day = ? WHERE id = ?', [request.requested_quantity, subs[0].id]);
      } else {
        // Create new subscription if none exists
        const [[product]] = await pool.query('SELECT price_per_unit FROM products WHERE id = ?', [request.product_id]);
        const [[customer]] = await pool.query('SELECT address FROM customers WHERE id = ?', [request.customer_id]);
        await pool.query(
          `INSERT INTO subscriptions (customer_id, product_id, quantity_per_day, price_per_unit, start_date, status, delivery_address)
           VALUES (?, ?, ?, ?, CURDATE(), 'ACTIVE', ?)`,
          [request.customer_id, request.product_id, request.requested_quantity, product.price_per_unit, customer.address]
        );
      }
      
      // Update today's PENDING deliveries if effective date is today or earlier
      const todayStr = todayIST();
      const reqDateStr = new Date(request.effective_date).toISOString().split('T')[0];
      if (reqDateStr <= todayStr) {
        await pool.query(
          `UPDATE deliveries SET delivered_quantity = ? WHERE customer_id = ? AND date = ? AND status = 'PENDING'`,
          [request.requested_quantity, request.customer_id, todayStr]
        );
      }
      
      // Update customer_requirements for legacy compat
      await pool.query(
        `INSERT INTO customer_requirements (customer_id, product_id, quantity)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE quantity = VALUES(quantity)`,
        [request.customer_id, request.product_id, request.requested_quantity]
      );
      
      // Notify customer
      const { notifyAdminAndDeliveryBoy } = require('../services/notificationService');
      // Wait, notifyAdminAndDeliveryBoy notifies admins and delivery boys. We need a way to notify the customer.
      // For now we'll skip notifying customer directly as it's not implemented yet in the service, but it's fine.
    } else {
      await pool.query('UPDATE quantity_change_requests SET status = "REJECTED", admin_note = ? WHERE id = ?', [admin_note || '', id]);
    }
    
    res.json({ message: `Request ${action === 'APPROVE' ? 'approved' : 'rejected'} successfully` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


const addWalletCredit = async (req, res) => {
    try {
        const { customer_id, amount, description } = req.body;
        if (!customer_id || !amount) return res.status(400).json({ message: 'Customer ID and amount are required' });
        
        const [[customer]] = await pool.query('SELECT wallet_balance FROM customers WHERE id = ?', [customer_id]);
        if (!customer) return res.status(404).json({ message: 'Customer not found' });
        
        const newBalance = parseFloat(customer.wallet_balance || 0) + parseFloat(amount);
        
        await pool.query('UPDATE customers SET wallet_balance = ? WHERE id = ?', [newBalance, customer_id]);
        await pool.query(`
            INSERT INTO wallet_transactions (customer_id, type, amount, description, balance_after, created_by)
            VALUES (?, 'CREDIT', ?, ?, ?, ?)
        `, [customer_id, amount, description || 'Admin manual credit', newBalance, req.user.id]);
        
        res.json({ message: 'Credit added successfully', new_balance: newBalance });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getCustomerWalletHistory = async (req, res) => {
    try {
        const { customer_id } = req.params;
        const [[customer]] = await pool.query('SELECT wallet_balance FROM customers WHERE id = ?', [customer_id]);
        const [transactions] = await pool.query('SELECT * FROM wallet_transactions WHERE customer_id = ? ORDER BY created_at DESC', [customer_id]);
        
        res.json({ balance: customer ? customer.wallet_balance : 0, transactions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


const PDFDocument = require('pdfkit');

const downloadAdminBillPDF = async (req, res) => {
    try {
        const { id } = req.params;
        const [[bill]] = await pool.query(`
            SELECT b.*, c.address, u.name as customer_name, u.phone 
            FROM bills b
            JOIN customers c ON b.customer_id = c.id
            JOIN users u ON c.user_id = u.id
            WHERE b.id = ?
        `, [id]);
        
        if (!bill) return res.status(404).json({ message: 'Bill not found' });
        
        const doc = new PDFDocument({ margin: 50 });
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Dairy_Bill_${bill.month}_${bill.year}_${bill.customer_name.replace(/\s+/g, '_')}.pdf"`);
        
        doc.pipe(res);
        
        // Header
        doc.fontSize(20).fillColor('#0D47A1').text('DAIRY MANAGEMENT SYSTEM', { align: 'center' });
        doc.fontSize(10).fillColor('#666666').text('Official Monthly Invoice', { align: 'center' });
        doc.moveDown();
        
        // Bill Details
        doc.fontSize(12).fillColor('#000000').text(`Bill ID: #${bill.id}`);
        doc.text(`Date Generated: ${new Date(bill.generated_date).toLocaleDateString()}`);
        doc.text(`Status: ${bill.status}`);
        doc.text(`Billing Period: ${bill.month}/${bill.year}`);
        doc.moveDown();
        
        // Customer Details
        doc.text(`Customer Name: ${bill.customer_name}`);
        doc.text(`Phone: ${bill.phone}`);
        doc.text(`Address: ${bill.address || 'N/A'}`);
        doc.moveDown();
        
        // Divider
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#CCCCCC');
        doc.moveDown();
        
        // Summary Table
        doc.fontSize(14).fillColor('#0D47A1').text('Usage Summary');
        doc.moveDown(0.5);
        doc.fontSize(12).fillColor('#000000');
        
        doc.text(`Total Days in Month: ${bill.total_days || 30}`);
        doc.text(`Delivered Days: ${bill.delivered_days || 0}`);
        doc.text(`Skipped/Missed Days: ${(bill.skipped_days || 0) + (bill.missed_days || 0)}`);
        doc.text(`Total Milk Quantity: ${bill.total_liters} Liters`);
        doc.moveDown();
        
        // Cost Breakdown
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#CCCCCC');
        doc.moveDown();
        
        doc.text(`Subscription Charges: Rs. ${parseFloat(bill.subscription_charge || 0).toFixed(2)}`);
        if (bill.addon_charge > 0) {
            doc.text(`Add-on Charges: Rs. ${parseFloat(bill.addon_charge).toFixed(2)}`);
        }
        if (bill.adjustments != 0) {
            doc.text(`Adjustments: Rs. ${parseFloat(bill.adjustments || 0).toFixed(2)}`);
        }
        
        doc.moveDown();
        doc.fontSize(16).fillColor('#0D47A1').text(`Total Amount Payable: Rs. ${parseFloat(bill.amount).toFixed(2)}`, { underline: true });
        
        doc.moveDown(3);
        doc.fontSize(10).fillColor('#999999').text('Thank you for choosing our dairy service!', { align: 'center' });
        
        doc.end();
    } catch (error) {
        console.error(error);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Error generating PDF' });
        }
    }
};


const getDeliveryPerformance = async (req, res) => {
    try {
        const month = req.query.month || req.body?.month; const year = req.query.year || req.body?.year; // optional
        let dateCondition = "WHERE d.date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)";
        let queryParams = [];
        
        if (month && year) {
            dateCondition = "WHERE MONTH(d.date) = ? AND YEAR(d.date) = ?";
            queryParams = [month, year];
        }
        
        const [performance] = await pool.query(`
            SELECT 
                db.id as delivery_boy_id,
                u.name,
                COUNT(d.id) as total_assigned,
                SUM(CASE WHEN d.status = 'DELIVERED' THEN 1 ELSE 0 END) as total_delivered,
                SUM(CASE WHEN d.status = 'CUSTOMER_SKIPPED' THEN 1 ELSE 0 END) as total_skipped,
                SUM(CASE WHEN d.status IN ('NOT_DELIVERED', 'DELIVERY_FAILED') THEN 1 ELSE 0 END) as total_missed,
                ROUND((SUM(CASE WHEN d.status = 'DELIVERED' THEN 1 ELSE 0 END) / NULLIF(COUNT(d.id) - SUM(CASE WHEN d.status = 'CUSTOMER_SKIPPED' THEN 1 ELSE 0 END), 0)) * 100, 2) as on_time_rate
            FROM delivery_boys db
            JOIN users u ON db.user_id = u.id
            LEFT JOIN deliveries d ON d.delivery_boy_id = db.id
            ${dateCondition.replace('WHERE', 'AND')}
            GROUP BY db.id, u.name
            ORDER BY on_time_rate DESC
        `, queryParams);
        
        res.json(performance);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};


const getAuditLogs = async (req, res) => {
    try {
        const [logs] = await pool.query(`
            SELECT a.*, u.name as user_name, u.role as user_role 
            FROM audit_log a
            LEFT JOIN users u ON a.user_id = u.id
            ORDER BY a.created_at DESC
            LIMIT 100
        `);
        res.json(logs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};


const addStaff = async (req, res) => {
    try {
        const { name, phone, email, password, role } = req.body;
        const validRoles = ['INVENTORY_MNGR', 'BILLING_CLERK', 'SUPPORT', 'ADMIN'];
        const staffRole = validRoles.includes(role) ? role : 'SUPPORT';

        const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await pool.query(
            'INSERT INTO users (name, phone, email, password, role) VALUES (?, ?, ?, ?, ?)',
            [name, phone, email, hashedPassword, staffRole]
        );

        res.status(201).json({ message: 'Staff added successfully with role: ' + staffRole });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error adding staff' });
    }
};


const { generateForDate } = require('../services/deliveryGenerator');

const generateDailyDeliveries = async (req, res) => {
    try {
        const date = req.query.date || req.body?.date;
        const result = await generateForDate(date);
        res.json({ message: 'Deliveries generated successfully', result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to generate deliveries', error: err.message });
    }
};

const reorderRoute = async (req, res) => {
    try {
        const { deliveryBoyId, orderedCustomerIds } = req.body;
        if (!deliveryBoyId || !Array.isArray(orderedCustomerIds)) {
            return res.status(400).json({ message: 'deliveryBoyId and orderedCustomerIds array required' });
        }
        for (let i = 0; i < orderedCustomerIds.length; i++) {
            await pool.query(
                'UPDATE delivery_routes SET stop_order = ? WHERE delivery_boy_id = ? AND customer_id = ?',
                [i + 1, deliveryBoyId, orderedCustomerIds[i]]
            );
        }
        res.json({ message: 'Route stop order updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error reordering route', error: err.message });
    }
};

const optimizeRouteByDistance = async (req, res) => {
    try {
        const { deliveryBoyId } = req.body;
        if (!deliveryBoyId) return res.status(400).json({ message: 'deliveryBoyId is required' });

        const [stops] = await pool.query(`
            SELECT dr.customer_id, c.gps_lat, c.gps_lng, u.name
            FROM delivery_routes dr
            JOIN customers c ON dr.customer_id = c.id
            JOIN users u ON c.user_id = u.id
            WHERE dr.delivery_boy_id = ?
        `, [deliveryBoyId]);

        if (stops.length <= 2) {
            return res.json({ message: 'Route optimized (2 or fewer stops)', stops });
        }

        const dist = (p1, p2) => {
            const lat1 = parseFloat(p1.gps_lat) || 0;
            const lng1 = parseFloat(p1.gps_lng) || 0;
            const lat2 = parseFloat(p2.gps_lat) || 0;
            const lng2 = parseFloat(p2.gps_lng) || 0;
            return Math.hypot(lat2 - lat1, lng2 - lng1);
        };

        const unvisited = [...stops];
        const ordered = [unvisited.shift()];

        while (unvisited.length > 0) {
            const current = ordered[ordered.length - 1];
            let bestIdx = 0;
            let bestDist = Infinity;

            for (let i = 0; i < unvisited.length; i++) {
                const d = dist(current, unvisited[i]);
                if (d < bestDist) {
                    bestDist = d;
                    bestIdx = i;
                }
            }
            ordered.push(unvisited.splice(bestIdx, 1)[0]);
        }

        for (let i = 0; i < ordered.length; i++) {
            await pool.query(
                'UPDATE delivery_routes SET stop_order = ? WHERE delivery_boy_id = ? AND customer_id = ?',
                [i + 1, deliveryBoyId, ordered[i].customer_id]
            );
        }

        res.json({ message: 'Route optimized successfully using nearest-neighbor sequencing', ordered });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error optimizing route', error: err.message });
    }
};

module.exports = {
  generateDailyDeliveries,
  reorderRoute,
  optimizeRouteByDistance,
  addStaff,
  getAuditLogs,
  getDeliveryPerformance,
  downloadAdminBillPDF,
  addWalletCredit,
  getCustomerWalletHistory,
  getQuantityChangeRequests,
  handleQuantityChangeRequest,
    getUpcomingExceptions,
    addManualException,
    getTomorrowRoutesSummary, getDashboard, addCustomer, assignRoute, getDailyLogs, generateBills, getMonthlyBilling, getDeliveryBoys, addDeliveryBoy, getCustomers, getDailyDeliveryReport, generateMonthlyBills, getCustomerLedger, finalizeBill, recordBillPayment, getBillingOverview };