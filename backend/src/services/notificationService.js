const pool = require('../config/db');

const sendNotification = async (userId, title, message) => {
    try {
        await pool.query(
            'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
            [userId, title, message]
        );
    } catch (e) {
        console.error('Failed to send notification:', e);
    }
};

const notifyAdminAndDeliveryBoy = async (customerId, title, message) => {
    try {
        // Find the delivery boy's user_id assigned to this customer
        const [db] = await pool.query(`
            SELECT db.user_id 
            FROM delivery_routes dr 
            JOIN delivery_boys db ON dr.delivery_boy_id = db.id 
            WHERE dr.customer_id = ?
        `, [customerId]);
        
        // Find all admins
        const [admins] = await pool.query(`SELECT id FROM users WHERE role = 'ADMIN'`);
        
        // Notify Delivery Boy
        if (db.length > 0) {
            await sendNotification(db[0].user_id, title, message);
        }
        
        // Notify Admins
        for (const admin of admins) {
            await sendNotification(admin.id, title, message);
        }
    } catch (e) {
        console.error('Failed to notify admin and delivery boy:', e);
    }
};

module.exports = { sendNotification, notifyAdminAndDeliveryBoy };
