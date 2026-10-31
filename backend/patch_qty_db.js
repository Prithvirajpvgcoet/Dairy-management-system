const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
    const pool = mysql.createPool({ host: process.env.DB_HOST || 'localhost', user: process.env.DB_USER || 'root', password: process.env.DB_PASSWORD || '', database: process.env.DB_NAME || 'dairy_app' });
    try {
        await pool.query(`
            CREATE TABLE quantity_change_requests (
              id INT AUTO_INCREMENT PRIMARY KEY,
              customer_id INT NOT NULL,
              product_id INT NOT NULL,
              current_quantity DECIMAL(5,2) NOT NULL,
              requested_quantity DECIMAL(5,2) NOT NULL,
              effective_date DATE NOT NULL,
              status ENUM('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
              reason VARCHAR(200) NULL,
              admin_note VARCHAR(200) NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (customer_id) REFERENCES customers(id),
              FOREIGN KEY (product_id) REFERENCES products(id)
            )
        `);
        console.log('Created quantity_change_requests');
    } catch(e) { console.error(e) }
    process.exit(0);
}
run();
