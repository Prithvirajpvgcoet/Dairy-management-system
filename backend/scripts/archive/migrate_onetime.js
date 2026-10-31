const mysql = require('mysql2/promise');
require('dotenv').config();

const migrate = async () => {
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
    console.log("Starting migration for one-time orders...");

    // 1. Alter bills table
    try {
        await pool.query("ALTER TABLE bills ADD COLUMN bill_type ENUM('SUBSCRIPTION', 'ONE_TIME') DEFAULT 'SUBSCRIPTION'");
        console.log("Added bill_type to bills");
    } catch (e) {
        if(e.code === 'ER_DUP_FIELDNAME') console.log("bill_type already exists");
        else throw e;
    }

    // 2. Create orders table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        status ENUM('PENDING', 'DELIVERED', 'CANCELLED') DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
      )
    `);
    console.log("Created orders table");

    // 3. Create order_items table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity DECIMAL(10,2) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);
    console.log("Created order_items table");

    console.log("Migration successful!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    pool.end();
  }
};

migrate();
