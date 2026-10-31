const pool = require('../config/db');

const getDashboard = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Get customer ID
        const [customerResult] = await pool.query('SELECT id, address FROM customers WHERE user_id = ?', [userId]);
        if (customerResult.length === 0) return res.status(404).json({ message: 'Customer not found' });
        const customerId = customerResult[0].id;
        const address = customerResult[0].address;

        // Get user name
        const [userResult] = await pool.query('SELECT name FROM users WHERE id = ?', [userId]);
        const userName = userResult[0].name;

        // Get all available products
        const [products] = await pool.query('SELECT * FROM products');

        // Get customer current requirements
        const [requirements] = await pool.query('SELECT product_id, quantity FROM customer_requirements WHERE customer_id = ?', [customerId]);

        // Map requirements to products for easier frontend handling
        const requirementsMap = {};
        let totalItems = 0;
        let totalSum = 0;

        products.forEach(p => {
            const req = requirements.find(r => r.product_id === p.id);
            const qty = req ? parseFloat(req.quantity) : 0;
            requirementsMap[p.id] = qty;
            totalItems += qty;
            totalSum += qty * p.price_per_unit;
        });

        // Get unpaid bills sum (just a mock for UI or real calculation)
        const [bills] = await pool.query('SELECT SUM(amount) as pending_bills FROM bills WHERE customer_id = ? AND status = "PENDING"', [customerId]);
        const pendingBills = bills[0].pending_bills || 0;

        res.json({ 
            user: { name: userName, address: address },
            products: products,
            requirements: requirementsMap,
            summary: {
                totalItems,
                totalSum,
                pendingBills
            }
        });
    } catch (error) {
        console.error("Dashboard error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateRequirements = async (req, res) => {
    try {
        const userId = req.user.id;
        const { requirements } = req.body; // Expects object: { "1": 2, "2": 0, "3": 1.5 } -> { productId: quantity }

        const [customerResult] = await pool.query('SELECT id FROM customers WHERE user_id = ?', [userId]);
        if (customerResult.length === 0) return res.status(404).json({ message: 'Customer not found' });
        const customerId = customerResult[0].id;

        for (const [productId, quantity] of Object.entries(requirements)) {
            if (quantity > 0) {
                await pool.query(`
                    INSERT INTO customer_requirements (customer_id, product_id, quantity) 
                    VALUES (?, ?, ?)
                    ON DUPLICATE KEY UPDATE quantity = ?
                `, [customerId, productId, quantity, quantity]);
            } else {
                await pool.query('DELETE FROM customer_requirements WHERE customer_id = ? AND product_id = ?', [customerId, productId]);
            }
        }

        res.json({ message: 'Requirements updated successfully' });
    } catch (error) {
        console.error("Update requirements error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const [customerResult] = await pool.query('SELECT id FROM customers WHERE user_id = ?', [userId]);
        if (customerResult.length === 0) return res.status(404).json({ message: 'Customer not found' });
        const customerId = customerResult[0].id;

        // Fetch past deliveries
        const [orders] = await pool.query(`
            SELECT d.id, d.date, d.status, d.delivered_quantity,
                   (SELECT u.name FROM delivery_boys db JOIN users u ON db.user_id = u.id WHERE db.id = d.delivery_boy_id) as delivery_boy
            FROM deliveries d
            WHERE d.customer_id = ?
            ORDER BY d.date DESC
            LIMIT 30
        `, [customerId]);
        
        // Fetch current cart / requirements
        const [requirements] = await pool.query(`
            SELECT cr.quantity, p.id as product_id, p.name, p.unit, p.price_per_unit, p.icon 
            FROM customer_requirements cr
            JOIN products p ON cr.product_id = p.id
            WHERE cr.customer_id = ?
        `, [customerId]);

        let dailyCost = 0;
        let totalItems = 0;
        requirements.forEach(req => {
            dailyCost += (req.quantity * req.price_per_unit);
            totalItems += parseFloat(req.quantity);
        });

        res.json({
            pastOrders: orders,
            currentOrder: {
                items: requirements,
                dailyCost,
                totalItems,
                monthlyEstimate: dailyCost * 30
            }
        });
    } catch (error) {
        console.error("Orders error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getBills = async (req, res) => {
    try {
        const userId = req.user.id;
        const [customerResult] = await pool.query('SELECT id FROM customers WHERE user_id = ?', [userId]);
        if (customerResult.length === 0) return res.status(404).json({ message: 'Customer not found' });
        const customerId = customerResult[0].id;

        const [bills] = await pool.query(`
            SELECT id, month, year, amount, paid_amount, status, generated_date, bill_type
            FROM bills
            WHERE customer_id = ?
            ORDER BY year DESC, CAST(month AS UNSIGNED) DESC, id DESC
        `, [customerId]);
        
        res.json(bills);
    } catch (error) {
        console.error("Bills error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getAccount = async (req, res) => {
    try {
        const userId = req.user.id;
        const [userResult] = await pool.query('SELECT name, email, phone FROM users WHERE id = ?', [userId]);
        const [customerResult] = await pool.query('SELECT id, address FROM customers WHERE user_id = ?', [userId]);
        
        if (userResult.length === 0) return res.status(404).json({ message: 'User not found' });
        
        const customerId = customerResult.length > 0 ? customerResult[0].id : null;
        let subscriptionStatus = 'INACTIVE';

        if(customerId) {
            // Check if they have active requirements
            const [reqs] = await pool.query('SELECT COUNT(*) as count FROM customer_requirements WHERE customer_id = ?', [customerId]);
            if(reqs[0].count > 0) {
                // Check if they have a PAID bill for current month
                const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
                const currentYear = new Date().getFullYear();
                const [bills] = await pool.query('SELECT status FROM bills WHERE customer_id = ? AND month = ? AND year = ?', [customerId, currentMonth, currentYear]);
                
                if(bills.length > 0 && bills[0].status === 'PAID') {
                    subscriptionStatus = 'ACTIVE';
                } else {
                    subscriptionStatus = 'PENDING PAYMENT';
                }
            }
        }

        res.json({
            name: userResult[0].name,
            email: userResult[0].email,
            phone: userResult[0].phone || 'Not provided',
            address: customerResult.length > 0 ? customerResult[0].address : 'Not provided',
            subscriptionStatus
        });
    } catch (error) {
        console.error("Account error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

const checkoutSubscription = async (req, res) => {
    try {
        const userId = req.user.id;
        const [customerResult] = await pool.query('SELECT id FROM customers WHERE user_id = ?', [userId]);
        if (customerResult.length === 0) return res.status(404).json({ message: 'Customer not found' });
        const customerId = customerResult[0].id;

        // Calculate total monthly amount from requirements
        const [requirements] = await pool.query(`
            SELECT cr.quantity, p.price_per_unit 
            FROM customer_requirements cr
            JOIN products p ON cr.product_id = p.id
            WHERE cr.customer_id = ?
        `, [customerId]);

        let dailyCost = 0;
        let totalItems = 0;
        requirements.forEach(req => {
            dailyCost += (req.quantity * req.price_per_unit);
            totalItems += parseFloat(req.quantity);
        });

        const monthlyCost = dailyCost * 30; // 30 days subscription

        if (monthlyCost === 0) {
            return res.status(400).json({ message: 'No requirements to checkout' });
        }

        const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
        const currentYear = new Date().getFullYear();

        const [existing] = await pool.query('SELECT id FROM bills WHERE customer_id = ? AND month = ? AND year = ? AND bill_type = "SUBSCRIPTION"', [customerId, currentMonth, currentYear]);

        if (existing.length > 0) {
            await pool.query(`
                UPDATE bills SET status = 'PAID', amount = ?, total_liters = ?, generated_date = CURDATE()
                WHERE id = ?
            `, [monthlyCost, totalItems * 30, existing[0].id]);
        } else {
            await pool.query(`
                INSERT INTO bills (customer_id, month, year, total_liters, amount, generated_date, status, bill_type)
                VALUES (?, ?, ?, ?, ?, CURDATE(), 'PAID', 'SUBSCRIPTION')
            `, [customerId, currentMonth, currentYear, totalItems * 30, monthlyCost]);
        }

        res.json({ message: 'Subscription checkout successful', amount: monthlyCost });
    } catch (error) {
        console.error("Subscription checkout error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

const checkoutOnetime = async (req, res) => {
    try {
        const userId = req.user.id;
        const { items } = req.body; // Array of {product_id, quantity, price_per_unit}
        
        if (!items || items.length === 0) {
             return res.status(400).json({ message: 'Cart is empty' });
        }

        const [customerResult] = await pool.query('SELECT id FROM customers WHERE user_id = ?', [userId]);
        if (customerResult.length === 0) return res.status(404).json({ message: 'Customer not found' });
        const customerId = customerResult[0].id;

        let totalAmount = 0;
        let totalItems = 0;
        items.forEach(item => {
            totalAmount += (item.quantity * item.price_per_unit);
            totalItems += parseFloat(item.quantity);
        });

        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Insert into orders
            const [orderResult] = await connection.query(`
                INSERT INTO orders (customer_id, total_amount, status)
                VALUES (?, ?, 'PENDING')
            `, [customerId, totalAmount]);
            const orderId = orderResult.insertId;

            // 2. Insert into order_items
            for (const item of items) {
                await connection.query(`
                    INSERT INTO order_items (order_id, product_id, quantity, price)
                    VALUES (?, ?, ?, ?)
                `, [orderId, item.product_id, item.quantity, item.price_per_unit]);
            }

            // 3. Generate ONE_TIME bill
            const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
            const currentYear = new Date().getFullYear();
            await connection.query(`
                INSERT INTO bills (customer_id, month, year, total_liters, amount, generated_date, status, bill_type)
                VALUES (?, ?, ?, ?, ?, CURDATE(), 'PAID', 'ONE_TIME')
            `, [customerId, currentMonth, currentYear, totalItems, totalAmount]);

            await connection.commit();
            res.json({ message: 'One-time order successful', amount: totalAmount, orderId });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error("One-time checkout error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};


const requestQuantityChange = async (req, res) => {
  try {
    const { requests } = req.body; // array of { product_id, requested_quantity, effective_date, reason }
    const [[customer]] = await pool.query('SELECT id FROM customers WHERE user_id = ?', [req.user.id]);
    
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    for (const reqObj of requests) {
      // Find current quantity
      const [subs] = await pool.query('SELECT quantity_per_day FROM subscriptions WHERE customer_id = ? AND product_id = ? AND status = "ACTIVE"', [customer.id, reqObj.product_id]);
      const currentQty = subs.length > 0 ? subs[0].quantity_per_day : 0;
      
      if (currentQty != reqObj.requested_quantity) {
        await pool.query(
          `INSERT INTO quantity_change_requests (customer_id, product_id, current_quantity, requested_quantity, effective_date, reason)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [customer.id, reqObj.product_id, currentQty, reqObj.requested_quantity, reqObj.effective_date, reqObj.reason || '']
        );
      }
    }
    
    res.status(201).json({ message: 'Quantity change requests submitted for admin approval.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


const getMyWallet = async (req, res) => {
    try {
        const [[customer]] = await pool.query('SELECT id, wallet_balance FROM customers WHERE user_id = ?', [req.user.id]);
        if (!customer) return res.status(404).json({ message: 'Customer not found' });
        
        const [transactions] = await pool.query('SELECT * FROM wallet_transactions WHERE customer_id = ? ORDER BY created_at DESC', [customer.id]);
        
        res.json({ balance: customer.wallet_balance, transactions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


const PDFDocument = require('pdfkit');

const downloadBillPDF = async (req, res) => {
    try {
        const { id } = req.params;
        const [[bill]] = await pool.query(`
            SELECT b.*, c.address, u.name as customer_name, u.phone 
            FROM bills b
            JOIN customers c ON b.customer_id = c.id
            JOIN users u ON c.user_id = u.id
            WHERE b.id = ? AND u.id = ?
        `, [id, req.user.id]);
        
        if (!bill) return res.status(404).json({ message: 'Bill not found' });
        
        const doc = new PDFDocument({ margin: 50 });
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Dairy_Bill_${bill.month}_${bill.year}.pdf"`);
        
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


const subscribePlan = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const userId = req.user.id;
        const { planId, startDate, deliverySlot } = req.body;

        if (!planId) {
            return res.status(400).json({ message: 'Plan ID is required' });
        }

        const [customers] = await connection.query(
            'SELECT c.id, u.name, u.phone, c.address, dr.delivery_boy_id FROM customers c JOIN users u ON c.user_id = u.id LEFT JOIN delivery_routes dr ON c.id = dr.customer_id WHERE c.user_id = ?',
            [userId]
        );
        if (customers.length === 0) {
            return res.status(404).json({ message: 'Customer profile not found' });
        }
        const customer = customers[0];

        const [plans] = await connection.query('SELECT * FROM subscription_plans WHERE id = ?', [planId]);
        if (plans.length === 0) {
            return res.status(404).json({ message: 'Subscription plan not found' });
        }
        const plan = plans[0];

        const [items] = await connection.query(
            'SELECT product_id, quantity_per_day FROM subscription_plan_items WHERE plan_id = ?',
            [planId]
        );

        if (items.length === 0 && !plan.is_custom) {
            return res.status(400).json({ message: 'Plan has no configured products' });
        }

        const { todayIST, addDays } = require('../utils/date');
        const start = startDate || addDays(todayIST(), 1);

        await connection.beginTransaction();

        if (deliverySlot) {
            await connection.query('UPDATE customers SET delivery_slot = ? WHERE id = ?', [deliverySlot, customer.id]);
        }

        for (const item of items) {
            await connection.query(
                "UPDATE subscriptions SET status = 'CANCELLED' WHERE customer_id = ? AND product_id = ? AND status = 'ACTIVE'",
                [customer.id, item.product_id]
            );

            const [pRows] = await connection.query('SELECT price_per_unit FROM products WHERE id = ?', [item.product_id]);
            const price = pRows[0]?.price_per_unit || 0;

            await connection.query(
                "INSERT INTO subscriptions (customer_id, product_id, quantity_per_day, price_per_unit, start_date, status, delivery_address) VALUES (?, ?, ?, ?, ?, 'ACTIVE', ?)",
                [customer.id, item.product_id, item.quantity_per_day, price, start, customer.address || 'Pune']
            );
        }

        const hasRoute = Boolean(customer.delivery_boy_id);
        if (!hasRoute) {
            await connection.query(
                'INSERT INTO notifications (user_id, title, message) VALUES (1, ?, ?)',
                [
                    'Unassigned Route Alert',
                    `Customer ${customer.name} (Phone: ${customer.phone}) subscribed to plan "${plan.name}". Please assign a delivery partner.`
                ]
            );
        }

        await connection.commit();

        try {
            const { generateForDate } = require('../services/deliveryGenerator');
            const tomorrow = addDays(todayIST(), 1);
            if (start <= tomorrow) {
                await generateForDate(tomorrow);
            }
        } catch (genErr) {
            console.warn('Delivery generator hook note:', genErr.message);
        }

        res.json({
            success: true,
            message: `Successfully subscribed to ${plan.name}!`,
            planName: plan.name,
            startDate: start,
            hasRoute: hasRoute,
            routeMessage: hasRoute 
                ? 'Your daily deliveries are scheduled and active.' 
                : 'Delivery starts once your local route is confirmed by our operations team.'
        });
    } catch (error) {
        await connection.rollback();
        console.error('subscribePlan error:', error);
        res.status(500).json({ message: 'Failed to activate subscription plan' });
    } finally {
        connection.release();
    }
};

module.exports = {
  subscribePlan,
  downloadBillPDF,
  getMyWallet,
  requestQuantityChange, getDashboard, updateRequirements, getOrders, getBills, getAccount, checkoutSubscription, checkoutOnetime };