const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
    const pool = mysql.createPool({ host: process.env.DB_HOST || 'localhost', user: process.env.DB_USER || 'root', password: process.env.DB_PASSWORD || '', database: process.env.DB_NAME || 'dairy_app' });
    try {
        await pool.query(`
            ALTER TABLE customers 
              ADD COLUMN gps_lat DECIMAL(10,7) NULL,
              ADD COLUMN gps_lng DECIMAL(10,7) NULL
        `);
        console.log('Added GPS columns to customers');
        
        // Let's seed some mock GPS data around a central point (e.g., Pune coordinates: 18.5204, 73.8567)
        const [customers] = await pool.query('SELECT id FROM customers');
        for (const c of customers) {
            const lat = 18.5204 + (Math.random() - 0.5) * 0.05;
            const lng = 73.8567 + (Math.random() - 0.5) * 0.05;
            await pool.query('UPDATE customers SET gps_lat = ?, gps_lng = ? WHERE id = ?', [lat, lng, c.id]);
        }
        console.log('Seeded mock GPS data for existing customers');
    } catch(e) { console.error(e) }
    process.exit(0);
}
run();
