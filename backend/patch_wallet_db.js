const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
    const pool = mysql.createPool({ host: process.env.DB_HOST || 'localhost', user: process.env.DB_USER || 'root', password: process.env.DB_PASSWORD || '', database: process.env.DB_NAME || 'dairy_app' });
    try {
        await pool.query(`
            CREATE TABLE wallet_transactions (
              id INT AUTO_INCREMENT PRIMARY KEY,
              customer_id INT NOT NULL,
              type ENUM('CREDIT','DEBIT') NOT NULL,
              amount DECIMAL(10,2) NOT NULL,
              description VARCHAR(200) NOT NULL,
              reference_id INT NULL,
              reference_type VARCHAR(50) NULL,
              balance_after DECIMAL(10,2) NOT NULL,
              created_by INT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (customer_id) REFERENCES customers(id)
            )
        `);
        console.log('Created wallet_transactions');
        
        await pool.query(`ALTER TABLE customers ADD COLUMN wallet_balance DECIMAL(10,2) DEFAULT 0.00`);
        console.log('Added wallet_balance to customers');
    } catch(e) { console.error(e) }
    process.exit(0);
}
run();
