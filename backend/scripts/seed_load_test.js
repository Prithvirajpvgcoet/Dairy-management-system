const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seedLoadTestData() {
    console.log('Connecting to database...');
    const pool = mysql.createPool({ 
        host: process.env.DB_HOST || 'localhost', 
        user: process.env.DB_USER || 'root', 
        password: process.env.DB_PASSWORD || '', 
        database: process.env.DB_NAME || 'dairy_db' 
    });

    try {
        const passwordHash = await bcrypt.hash('Test@1234', 10);
        console.log('Generated standard password hash.');

        // Get a valid product ID
        const [products] = await pool.query('SELECT id FROM products LIMIT 1');
        if (products.length === 0) {
            console.log('No products found. Creating a dummy product...');
            const [prodRes] = await pool.query("INSERT INTO products (name, description, price, unit) VALUES ('Cow Milk', 'Fresh', 70, 'Liter')");
            products.push({ id: prodRes.insertId });
        }
        const productId = products[0].id;

        console.log('Creating 10 Delivery Boys...');
        const deliveryBoyIds = [];
        for (let i = 1; i <= 10; i++) {
            const email = `delivery_load_${i}@dairy.com`;
            const name = `Load Tester Delivery Boy ${i}`;
            
            // Check if exists
            let [users] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
            let userId;
            if (users.length > 0) {
                userId = users[0].id;
            } else {
                const [userRes] = await pool.query(
                    'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, "DELIVERY_BOY", ?)',
                    [name, email, passwordHash, `999000${i.toString().padStart(4, '0')}`]
                );
                userId = userRes.insertId;
            }

            let [dbs] = await pool.query('SELECT id FROM delivery_boys WHERE user_id = ?', [userId]);
            let dbId;
            if (dbs.length > 0) {
                dbId = dbs[0].id;
            } else {
                const [dbRes] = await pool.query(
                    'INSERT INTO delivery_boys (user_id) VALUES (?)',
                    [userId]
                );
                dbId = dbRes.insertId;
            }
            deliveryBoyIds.push(dbId);
        }

        console.log('Creating 200 Customers (20 per Delivery Boy) and active subscriptions...');
        
        let customerCounter = 1;
        for (const dbId of deliveryBoyIds) {
            for (let j = 1; j <= 20; j++) {
                const email = `customer_load_${customerCounter}@dairy.com`;
                const name = `Load Tester Customer ${customerCounter}`;
                
                // Create user
                let [users] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
                let userId;
                if (users.length > 0) {
                    userId = users[0].id;
                } else {
                    const [userRes] = await pool.query(
                        'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, "CUSTOMER", ?)',
                        [name, email, passwordHash, `888000${customerCounter.toString().padStart(4, '0')}`]
                    );
                    userId = userRes.insertId;
                }

                // Create customer
                let [custs] = await pool.query('SELECT id FROM customers WHERE user_id = ?', [userId]);
                let customerId;
                if (custs.length > 0) {
                    customerId = custs[0].id;
                } else {
                    const [custRes] = await pool.query(
                        'INSERT INTO customers (user_id, address, gps_lat, gps_lng) VALUES (?, ?, ?, ?)',
                        [userId, `Address ${customerCounter}, Pune`, 18.5204 + (Math.random()*0.1), 73.8567 + (Math.random()*0.1)]
                    );
                    customerId = custRes.insertId;
                }

                // Ensure Active Subscription
                let [subs] = await pool.query('SELECT id FROM subscriptions WHERE customer_id = ?', [customerId]);
                if (subs.length === 0) {
                    await pool.query(
                        'INSERT INTO subscriptions (customer_id, product_id, quantity_per_day, price_per_unit, start_date, status) VALUES (?, ?, ?, ?, CURDATE(), "ACTIVE")',
                        [customerId, productId, 1.5, 70]
                    );
                } else {
                    // Force it active if not
                    await pool.query('UPDATE subscriptions SET status = "ACTIVE" WHERE customer_id = ?', [customerId]);
                }

                // Assign to delivery boy route
                let [routes] = await pool.query('SELECT id FROM delivery_routes WHERE customer_id = ? AND delivery_boy_id = ?', [customerId, dbId]);
                if (routes.length === 0) {
                    // Clear old route if exists
                    await pool.query('DELETE FROM delivery_routes WHERE customer_id = ?', [customerId]);
                    // Add new route
                    await pool.query(
                        'INSERT INTO delivery_routes (customer_id, delivery_boy_id) VALUES (?, ?)',
                        [customerId, dbId]
                    );
                }

                customerCounter++;
            }
        }

        console.log('✅ Successfully created 10 delivery boys and 200 assigned customers with active subscriptions!');
        console.log('You can test logging in with: delivery_load_1@dairy.com (Password: Test@1234)');
        
    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        await pool.end();
    }
}

seedLoadTestData();
