const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
    const pool = mysql.createPool({ host: process.env.DB_HOST || 'localhost', user: process.env.DB_USER || 'root', password: process.env.DB_PASSWORD || '', database: process.env.DB_NAME || 'dairy_app' });
    try {
        await pool.query(`
            ALTER TABLE users 
            MODIFY COLUMN role ENUM('ADMIN', 'CUSTOMER', 'DELIVERY_BOY', 'INVENTORY_MNGR', 'BILLING_CLERK', 'SUPPORT') NOT NULL DEFAULT 'CUSTOMER'
        `);
        console.log('Modified users table role ENUM');
    } catch(e) { console.error(e) }
    process.exit(0);
}
run();
