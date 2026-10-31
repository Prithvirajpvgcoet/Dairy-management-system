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

            // Public signup is locked strictly to CUSTOMER role
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

const getMe = async (req, res) => {
    try {
        const userId = req.user.id;
        const [users] = await pool.query('SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?', [userId]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });
        
        let profile = { ...users[0] };
        if (profile.role === 'CUSTOMER') {
            const [[cust]] = await pool.query('SELECT id as customer_id, address, wallet_balance, gps_lat, gps_lng FROM customers WHERE user_id = ?', [userId]);
            if (cust) profile = { ...profile, ...cust };
        } else if (profile.role === 'DELIVERY_BOY') {
            const [[db]] = await pool.query('SELECT id as delivery_boy_id, salary_type, salary_rate FROM delivery_boys WHERE user_id = ?', [userId]);
            if (db) profile = { ...profile, ...db };
        }

        res.json({ user: profile });
    } catch (error) {
        console.error('getMe error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current password and new password are required' });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters' });
        }

        const [[user]] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);

        await pool.query(
            'INSERT INTO audit_log (user_id, action, entity_type, entity_id, notes) VALUES (?, "PASSWORD_CHANGED", "user", ?, "User updated their account password")',
            [req.user.id, req.user.id]
        );

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('changePassword error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { login, signup, getMe, changePassword };
