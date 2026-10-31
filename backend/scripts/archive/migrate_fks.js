const mysql = require('mysql2/promise');
require('dotenv').config();

const migrateFKs = async () => {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'root',
        database: process.env.DB_NAME || 'dairy_db',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    try {
        console.log("Starting FK migrations & missing tables creation...");

        // Fix FKs for deliveries
        await pool.query('ALTER TABLE deliveries DROP FOREIGN KEY deliveries_ibfk_1');
        await pool.query('ALTER TABLE deliveries DROP FOREIGN KEY deliveries_ibfk_2');
        await pool.query('ALTER TABLE deliveries ADD CONSTRAINT fk_deliveries_cust FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE');
        await pool.query('ALTER TABLE deliveries ADD CONSTRAINT fk_deliveries_boy FOREIGN KEY (delivery_boy_id) REFERENCES delivery_boys(id) ON DELETE CASCADE');

        // Fix FKs for bills
        await pool.query('ALTER TABLE bills DROP FOREIGN KEY bills_ibfk_1');
        await pool.query('ALTER TABLE bills ADD CONSTRAINT fk_bills_cust FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE');
        
        // Add bill_type to bills if it doesn't exist (added in checkoutOnetime)
        try {
            await pool.query("ALTER TABLE bills ADD COLUMN bill_type ENUM('SUBSCRIPTION', 'ONE_TIME') DEFAULT 'SUBSCRIPTION'");
        } catch (e) {
            console.log("bill_type might already exist");
        }

        // Create orders table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                customer_id INT NOT NULL,
                total_amount DECIMAL(10,2) NOT NULL,
                status ENUM('PENDING', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
            )
        `);

        // Create order_items table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS order_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                product_id INT NOT NULL,
                quantity DECIMAL(5,2) NOT NULL,
                price DECIMAL(10,2) NOT NULL,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
            )
        `);

        console.log("Migration completed successfully!");
    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        await pool.end();
    }
};

migrateFKs();
