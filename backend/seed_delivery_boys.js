const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

require('dotenv').config();

const seedDeliveryBoys = async () => {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'root',
        database: process.env.DB_NAME || 'dairy_db',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    const boys = [
        { name: 'Rahul Sharma', phone: '9876543201', email: 'rahul@dairy.com', password: 'password123', salary_type: 'FIXED', salary_rate: 6000 },
        { name: 'Amit (Aundh)', phone: '9876543202', email: 'amit@dairy.com', password: 'password123', salary_type: 'PER_LITER', salary_rate: 5 },
        { name: 'Suresh (Pashan)', phone: '9876543203', email: 'suresh@dairy.com', password: 'password123', salary_type: 'FIXED_PLUS_INCENTIVE', salary_rate: 4500 },
        { name: 'Vikram Singh', phone: '9876543204', email: 'vikram@dairy.com', password: 'password123', salary_type: 'FIXED', salary_rate: 7000 },
    ];

    try {
        console.log("Connecting to database and creating delivery boys...");
        
        for (const boy of boys) {
            // Check if exists
            const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [boy.email]);
            if (existing.length > 0) {
                console.log(`Skipping ${boy.name}, already exists.`);
                continue;
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(boy.password, salt);

            const [userResult] = await pool.query(
                'INSERT INTO users (name, phone, email, password, role) VALUES (?, ?, ?, ?, "DELIVERY_BOY")',
                [boy.name, boy.phone, boy.email, hashedPassword]
            );

            const userId = userResult.insertId;
            await pool.query(
                'INSERT INTO delivery_boys (user_id, joining_date, salary_type, salary_rate) VALUES (?, CURDATE(), ?, ?)',
                [userId, boy.salary_type, boy.salary_rate]
            );

            console.log(`Successfully created Delivery Boy: ${boy.name}`);
        }

        // Seed Admin
        const [adminExists] = await pool.query('SELECT id FROM users WHERE email = ?', ['admin@dairy.com']);
        if (adminExists.length === 0) {
            const adminSalt = await bcrypt.genSalt(10);
            const adminHashed = await bcrypt.hash('admin123', adminSalt);
            await pool.query(
                'INSERT INTO users (name, phone, email, password, role) VALUES (?, ?, ?, ?, "ADMIN")',
                ['Super Admin', '9999999999', 'admin@dairy.com', adminHashed]
            );
            console.log("Successfully created Admin: admin@dairy.com");
        } else {
            console.log("Admin admin@dairy.com already exists.");
        }

        console.log("Seeding complete. Admin login is admin@dairy.com / admin123");
    } catch (error) {
        console.error("Error seeding delivery boys:", error);
    } finally {
        await pool.end();
    }
};

seedDeliveryBoys();
