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
        console.log("Starting inventory database migration...");

        await pool.query(`DROP TABLE IF EXISTS inventory`);
        console.log("Dropped old inventory table.");

        await pool.query(`
            CREATE TABLE inventory (
                id INT AUTO_INCREMENT PRIMARY KEY,
                date DATE NOT NULL,
                product_id INT NOT NULL,
                stock_in DECIMAL(10,2) DEFAULT 0,
                stock_out DECIMAL(10,2) DEFAULT 0,
                total_available DECIMAL(10,2) DEFAULT 0,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                UNIQUE(date, product_id)
            );
        `);
        console.log("Created new multi-product inventory table.");

        const [products] = await pool.query('SELECT id FROM products');
        for (const p of products) {
            await pool.query(`
                INSERT IGNORE INTO inventory (date, product_id, stock_in, stock_out, total_available)
                VALUES (CURDATE(), ?, 100, 0, 100)
            `, [p.id]);
        }
        console.log("Seeded initial inventory for today (100 units per product).");

        console.log("Inventory migration completed successfully!");
    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        await pool.end();
    }
};

migrate();
