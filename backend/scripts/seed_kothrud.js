const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seedKothrudCustomers() {
    console.log('Connecting to database...');
    const pool = mysql.createPool({ 
        host: process.env.DB_HOST || 'localhost', 
        user: process.env.DB_USER || 'root', 
        password: process.env.DB_PASSWORD || '', 
        database: process.env.DB_NAME || 'dairy_db' 
    });

    try {
        const passwordHash = await bcrypt.hash('Test@1234', 10);
        
        // 1. Get/Create Product
        const [products] = await pool.query('SELECT id FROM products LIMIT 1');
        const productId = products.length > 0 ? products[0].id : 1;

        // 2. Create a specific Delivery Boy for Kothrud
        const email = 'kothrud@dairy.com';
        let [users] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        let userId;
        
        if (users.length > 0) {
            userId = users[0].id;
        } else {
            const [userRes] = await pool.query(
                'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, "DELIVERY_BOY", ?)',
                ['Kothrud Delivery Partner', email, passwordHash, '9991112222']
            );
            userId = userRes.insertId;
        }

        let [dbs] = await pool.query('SELECT id FROM delivery_boys WHERE user_id = ?', [userId]);
        let dbId;
        if (dbs.length > 0) {
            dbId = dbs[0].id;
        } else {
            const [dbRes] = await pool.query('INSERT INTO delivery_boys (user_id) VALUES (?)', [userId]);
            dbId = dbRes.insertId;
        }

        console.log('Delivery Boy Created. ID:', dbId);

        // 3. Clear old customers assigned to this DB (if script is re-run)
        await pool.query('DELETE FROM delivery_routes WHERE delivery_boy_id = ?', [dbId]);

        // 4. Array of roughly real coordinates in Kothrud, Pune
        const kothrudLocations = [
            { name: "Rahul Deshmukh", address: "Karishma Society, Kothrud, Pune", lat: 18.4988, lng: 73.8188 },
            { name: "Priya Kulkarni", address: "City Pride, Kothrud, Pune", lat: 18.5020, lng: 73.8155 },
            { name: "Amit Joshi", address: "Dahanukar Colony, Kothrud, Pune", lat: 18.4942, lng: 73.8123 },
            { name: "Sneha Patil", address: "Mayur Colony, Kothrud, Pune", lat: 18.5074, lng: 73.8101 },
            { name: "Vikram Gokhale", address: "Rambaug Colony, Kothrud, Pune", lat: 18.5098, lng: 73.8192 },
            { name: "Neha Bhide", address: "Paud Road, Kothrud, Pune", lat: 18.5055, lng: 73.8055 },
            { name: "Sanjay Nene", address: "Bhusari Colony, Kothrud, Pune", lat: 18.5041, lng: 73.7990 },
            { name: "Pooja Date", address: "Kothrud Stand, Kothrud, Pune", lat: 18.5065, lng: 73.8143 },
            { name: "Ganesh Kelkar", address: "Eksar, Kothrud, Pune", lat: 18.5080, lng: 73.8062 },
            { name: "Manasi Vaze", address: "Ideal Colony, Kothrud, Pune", lat: 18.5030, lng: 73.8115 },
            { name: "Rohit Pande", address: "Tejas Nagar, Kothrud, Pune", lat: 18.4965, lng: 73.8090 },
            { name: "Aarti Bapat", address: "Mahatma Society, Kothrud, Pune", lat: 18.4915, lng: 73.8055 },
            { name: "Suresh Chavan", address: "Bhatewara Nagar, Kothrud, Pune", lat: 18.5015, lng: 73.8020 },
            { name: "Deepa Kale", address: "Ashish Vihar, Kothrud, Pune", lat: 18.5090, lng: 73.8080 },
            { name: "Nitin Kadam", address: "Paramhans Nagar, Kothrud, Pune", lat: 18.4995, lng: 73.8005 },
            { name: "Shruti Ranade", address: "Shivtirth Nagar, Kothrud, Pune", lat: 18.5060, lng: 73.8205 },
            { name: "Kunal Deshpande", address: "Anand Nagar, Kothrud, Pune", lat: 18.4950, lng: 73.8150 },
            { name: "Rutuja Oak", address: "Gujrat Colony, Kothrud, Pune", lat: 18.5005, lng: 73.8175 },
            { name: "Mangesh Sane", address: "Right Bhusari Colony, Kothrud, Pune", lat: 18.5050, lng: 73.7975 },
            { name: "Swati Phadke", address: "Chaitanya Nagar, Kothrud, Pune", lat: 18.4980, lng: 73.8140 },
        ];

        console.log('Creating 20 Kothrud Customers...');
        
        for (let i = 0; i < kothrudLocations.length; i++) {
            const loc = kothrudLocations[i];
            const custEmail = `kothrud_cust_${i+1}@dairy.com`;
            const phone = `999333${i.toString().padStart(4, '0')}`;

            // Create User
            let [cUsers] = await pool.query('SELECT id FROM users WHERE email = ?', [custEmail]);
            let cUserId;
            if (cUsers.length > 0) {
                cUserId = cUsers[0].id;
            } else {
                const [userRes] = await pool.query(
                    'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, "CUSTOMER", ?)',
                    [loc.name, custEmail, passwordHash, phone]
                );
                cUserId = userRes.insertId;
            }

            // Create Customer
            let [custs] = await pool.query('SELECT id FROM customers WHERE user_id = ?', [cUserId]);
            let customerId;
            if (custs.length > 0) {
                customerId = custs[0].id;
                // Update coordinates just in case
                await pool.query('UPDATE customers SET address = ?, gps_lat = ?, gps_lng = ? WHERE id = ?', 
                                [loc.address, loc.lat, loc.lng, customerId]);
            } else {
                const [custRes] = await pool.query(
                    'INSERT INTO customers (user_id, address, gps_lat, gps_lng) VALUES (?, ?, ?, ?)',
                    [cUserId, loc.address, loc.lat, loc.lng]
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
                await pool.query('UPDATE subscriptions SET status = "ACTIVE" WHERE customer_id = ?', [customerId]);
            }

            // Assign to Kothrud Route
            await pool.query(
                'INSERT INTO delivery_routes (customer_id, delivery_boy_id) VALUES (?, ?)',
                [customerId, dbId]
            );
        }

        console.log('✅ Successfully created 20 real Kothrud customers and assigned them!');
        console.log('You can test logging in with:');
        console.log('Email: kothrud@dairy.com');
        console.log('Password: Test@1234');
        
    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        await pool.end();
    }
}

seedKothrudCustomers();
