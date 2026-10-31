const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../config/jwt');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user by email
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            const token = generateToken(user.id, user.role);
            res.json({ token, role: user.role, name: user.name, message: 'Login successful' });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const signup = async (req, res) => {
    try {
        const { name, phone, address, email, password } = req.body;

        // Check if user already exists
        const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Task 1.7: Public signup is locked strictly to CUSTOMER role
            const userRole = 'CUSTOMER';

            // Insert into users table
            const [userResult] = await connection.query(
                'INSERT INTO users (name, phone, email, password, role) VALUES (?, ?, ?, ?, ?)',
                [name, phone, email, hashedPassword, userRole]
            );

            const userId = userResult.insertId;

            // Insert into customers table
            await connection.query(
                'INSERT INTO customers (user_id, address) VALUES (?, ?)',
                [userId, address || 'N/A']
            );

            const customerId = (await connection.query('SELECT LAST_INSERT_ID() as id'))[0][0].id;

            // Default requirement of 1L Cow Milk
            await connection.query(
                'INSERT INTO customer_requirements (customer_id, product_id, quantity) VALUES (?, 1, 1)',
                [customerId]
            );

            await connection.commit();
            const token = generateToken(userId, userRole);
            res.status(201).json({ token, role: userRole, name, message: 'Signup successful' });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during signup' });
    }
};

module.exports = { login, signup };
