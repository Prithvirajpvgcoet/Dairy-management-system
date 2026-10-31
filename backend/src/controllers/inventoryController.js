const { todayIST } = require('../utils/date');
const pool = require('../config/db');

const getInventory = async (req, res) => {
    try {
        const date = req.query.date || todayIST();

        // 1. Get all products
        const [products] = await pool.query('SELECT * FROM products ORDER BY id ASC');

        // 2. Get today's required quantities per product (aggregated from customer subscriptions)
        const [requirements] = await pool.query(`
            SELECT product_id, SUM(quantity) as required_quantity 
            FROM customer_requirements 
            GROUP BY product_id
        `);

        // 3. Get actual inventory for the requested date
        const [inventoryRecords] = await pool.query(`
            SELECT * FROM inventory WHERE date = ?
        `, [date]);

        const inventory = products.map(p => {
            const reqData = requirements.find(r => r.product_id === p.id);
            const invData = inventoryRecords.find(i => i.product_id === p.id);
            
            return {
                product_id: p.id,
                name: p.name,
                unit: p.unit,
                icon: p.icon,
                price: p.price_per_unit,
                required: reqData ? parseFloat(reqData.required_quantity) : 0,
                stock_in: invData ? parseFloat(invData.stock_in) : 0,
                stock_out: invData ? parseFloat(invData.stock_out) : 0,
                total_available: invData ? parseFloat(invData.total_available) : 0
            };
        });

        res.json({ date, inventory });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateInventory = async (req, res) => {
    try {
        const { date, product_id, stock_in } = req.body;
        
        if (!date || !product_id || stock_in === undefined) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Upsert inventory
        // stock_out is not touched directly here. We just add stock_in.
        await pool.query(`
            INSERT INTO inventory (date, product_id, stock_in, stock_out, total_available) 
            VALUES (?, ?, ?, 0, ?)
            ON DUPLICATE KEY UPDATE 
                stock_in = stock_in + VALUES(stock_in),
                total_available = total_available + VALUES(stock_in)
        `, [date, product_id, parseFloat(stock_in), parseFloat(stock_in)]);

        res.json({ message: 'Inventory updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getInventory,
    updateInventory
};
