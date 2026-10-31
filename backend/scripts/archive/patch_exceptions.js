const fs = require('fs');

const codeToAppend = `
// ----------------------------------------------------
// EXCEPTIONS & ADDONS (MANUAL ADMIN OVERRIDES)
// ----------------------------------------------------

const getUpcomingExceptions = async (req, res) => {
    try {
        const [skips] = await pool.query(\`
            SELECT s.id, s.skip_date as date, 'SKIP' as type, s.reason, s.status, s.created_at,
                   u.name as customer_name, u.phone as customer_phone
            FROM delivery_skip_requests s
            JOIN customers c ON s.customer_id = c.id
            JOIN users u ON c.user_id = u.id
            WHERE s.skip_date >= CURDATE()
            ORDER BY s.skip_date ASC
        \`);
        
        const [addons] = await pool.query(\`
            SELECT a.id, a.delivery_date as date, 'ADDON' as type, a.addon_quantity as quantity, a.status, a.created_at,
                   u.name as customer_name, u.phone as customer_phone, p.name as product_name
            FROM delivery_addons a
            JOIN customers c ON a.customer_id = c.id
            JOIN users u ON c.user_id = u.id
            JOIN products p ON a.product_id = p.id
            WHERE a.delivery_date >= CURDATE()
            ORDER BY a.delivery_date ASC
        \`);

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
                \`INSERT IGNORE INTO delivery_skip_requests (customer_id, skip_date, reason, status) VALUES (?, ?, ?, 'APPROVED')\`,
                [customer_id, date, reason || 'Admin Manual Override']
            );
            
            // Mark pending deliveries as skipped
            await pool.query(
                \`UPDATE deliveries SET status = 'CUSTOMER_SKIPPED' WHERE customer_id = ? AND date = ? AND status = 'PENDING'\`,
                [customer_id, date]
            );
        } else if (type === 'ADDON') {
            if (!product_id || !quantity) return res.status(400).json({ message: 'Product and quantity required for addon' });
            
            const [[product]] = await pool.query('SELECT price_per_unit FROM products WHERE id = ?', [product_id]);
            if (!product) return res.status(404).json({ message: 'Product not found' });
            
            const totalAmount = product.price_per_unit * quantity;
            
            await pool.query(
                \`INSERT INTO delivery_addons (customer_id, product_id, delivery_date, addon_quantity, price_per_unit, total_amount, status, created_by)
                 VALUES (?, ?, ?, ?, ?, ?, 'APPROVED', ?)\`,
                [customer_id, product_id, date, quantity, product.price_per_unit, totalAmount, req.user.id]
            );
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
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        // We want to list all delivery boys and see how many of their assigned customers have skips/addons tomorrow.
        const [routes] = await pool.query(\`
            SELECT 
                db.id as delivery_boy_id, 
                u.name as delivery_boy_name,
                COUNT(DISTINCT c.id) as total_customers,
                COUNT(DISTINCT s.id) as skipped_customers,
                COUNT(DISTINCT a.id) as addon_customers
            FROM delivery_boys db
            JOIN users u ON db.user_id = u.id
            JOIN customers c ON c.route_id = db.route_id
            LEFT JOIN delivery_skip_requests s ON s.customer_id = c.id AND s.skip_date = ? AND s.status = 'APPROVED'
            LEFT JOIN delivery_addons a ON a.customer_id = c.id AND a.delivery_date = ? AND a.status = 'APPROVED'
            GROUP BY db.id, u.name
        \`, [tomorrowStr, tomorrowStr]);

        res.json({ date: tomorrowStr, routes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

`;

let content = fs.readFileSync('src/controllers/adminController.js', 'utf8');
content = content.replace('module.exports = {', codeToAppend + 'module.exports = {\n    getUpcomingExceptions,\n    addManualException,\n    getTomorrowRoutesSummary,');
fs.writeFileSync('src/controllers/adminController.js', content);
console.log('Controller updated');
