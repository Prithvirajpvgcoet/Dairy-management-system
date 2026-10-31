const mysql = require('mysql2/promise');
require('dotenv').config();
async function run() {
    const pool = mysql.createPool({ host: process.env.DB_HOST||'localhost', user: process.env.DB_USER||'root', password: process.env.DB_PASSWORD||'', database: process.env.DB_NAME||'dairy_app' });
    const [users] = await pool.query('SELECT id FROM users WHERE email = ?', ['delivery_load_1@dairy.com']);
    const [dbs] = await pool.query('SELECT id FROM delivery_boys WHERE user_id = ?', [users[0].id]);
    const dbId = dbs[0].id;
    const [customers] = await pool.query(`
        SELECT c.*, s.quantity_per_day as requirement, p.name as product_name, p.unit,
            (SELECT status FROM deliveries WHERE customer_id = c.id AND date = CURDATE()) as delivery_status
        FROM customers c
        JOIN delivery_routes dr ON c.id = dr.customer_id
        JOIN subscriptions s ON c.id = s.customer_id
        JOIN products p ON s.product_id = p.id
        WHERE dr.delivery_boy_id = ? AND s.status = 'ACTIVE'
    `, [dbId]);
    console.log('Customers found on route:', customers.length);
    if(customers.length > 0) {
        console.log('Sample customer:', customers[0].id, customers[0].requirement);
    }
    process.exit(0);
}
run();
