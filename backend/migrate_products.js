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
        console.log("Starting database migration...");

        // 1. Create Products table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                unit VARCHAR(20) NOT NULL,
                price_per_unit DECIMAL(10,2) NOT NULL,
                icon VARCHAR(50) DEFAULT '📦',
                in_stock BOOLEAN DEFAULT TRUE
            );
        `);
        console.log("Created products table.");

        // 2. Create customer_requirements table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS customer_requirements (
                id INT AUTO_INCREMENT PRIMARY KEY,
                customer_id INT NOT NULL,
                product_id INT NOT NULL,
                quantity DECIMAL(5,2) DEFAULT 0,
                FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                UNIQUE(customer_id, product_id)
            );
        `);
        console.log("Created customer_requirements table.");

        // 3. Seed Products
        const products = [
            { id: 1, name: 'Cow Milk', unit: '1 L', price: 52.00, icon: '🥛' },
            { id: 2, name: 'Buffalo Milk', unit: '1 L', price: 60.00, icon: '🥛' },
            { id: 3, name: 'Curd', unit: '500 g', price: 45.00, icon: '🥣' },
            { id: 4, name: 'Paneer', unit: '500 g', price: 220.00, icon: '🧀' },
            { id: 5, name: 'Ghee', unit: '200 g', price: 120.00, icon: '🍯' }
        ];

        for (const p of products) {
            await pool.query(`
                INSERT IGNORE INTO products (id, name, unit, price_per_unit, icon) 
                VALUES (?, ?, ?, ?, ?)
            `, [p.id, p.name, p.unit, p.price, p.icon]);
        }
        console.log("Seeded products.");

        // 4. Migrate existing customer preferences
        // Since we are going to drop default_quantity and milk_type, we need to move them to customer_requirements first
        
        const [customers] = await pool.query('SELECT * FROM customers');
        for (const c of customers) {
            if (c.default_quantity !== undefined && c.milk_type !== undefined) {
                // Assuming existing milk type is either 'Cow' or 'Buffalo'
                let prodId = 1; // Default to Cow Milk
                if (c.milk_type && c.milk_type.toLowerCase().includes('buffalo')) {
                    prodId = 2;
                }
                
                await pool.query(`
                    INSERT IGNORE INTO customer_requirements (customer_id, product_id, quantity)
                    VALUES (?, ?, ?)
                `, [c.id, prodId, c.default_quantity]);
            }
        }
        console.log("Migrated existing customer requirements.");

        // 5. Drop old columns from customers
        // Note: we can't drop price_per_liter easily if we need it for historical bills, but for now we'll drop it to enforce the new schema.
        try {
            await pool.query('ALTER TABLE customers DROP COLUMN default_quantity');
            await pool.query('ALTER TABLE customers DROP COLUMN milk_type');
            await pool.query('ALTER TABLE customers DROP COLUMN price_per_liter');
            console.log("Dropped old columns from customers.");
        } catch (e) {
            console.log("Old columns already dropped or cannot be dropped: ", e.message);
        }

        console.log("Migration completed successfully!");
    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        await pool.end();
    }
};

migrate();
