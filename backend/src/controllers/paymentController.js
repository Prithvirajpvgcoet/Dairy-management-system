const Razorpay = require('razorpay');
const crypto = require('crypto');
const pool = require('../config/db');

const createOrder = async (req, res) => {
    try {
        const { amount, receipt } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Valid amount is required' });
        }

        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            return res.status(500).json({ message: 'Razorpay credentials not configured in environment' });
        }

        const razorpayInstance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        const options = {
            amount: Math.round(amount * 100), // amount in paise
            currency: "INR",
            receipt: receipt || `receipt_${Date.now()}`
        };

        const order = await razorpayInstance.orders.create(options);
        res.json({
            id: order.id,
            currency: order.currency,
            amount: order.amount
        });
    } catch (error) {
        console.error("Razorpay order creation error:", error);
        res.status(500).json({ message: 'Payment gateway error', error: error.message });
    }
};

const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bill_id, amount } = req.body;
        
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ success: false, message: 'Missing required Razorpay payment verification parameters' });
        }

        const secret = process.env.RAZORPAY_KEY_SECRET || 'test_secret_key_12345';
        if (!secret) {
            return res.status(500).json({ success: false, message: 'Razorpay secret key not configured in environment' });
        }

        const hmac = crypto.createHmac('sha256', secret);
        hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const generatedSignature = hmac.digest('hex');

        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }

        // If bill_id is provided, record payment against bill
        if (bill_id) {
            const [[bill]] = await pool.query('SELECT * FROM bills WHERE id = ?', [bill_id]);
            if (bill) {
                const payAmount = parseFloat(amount || bill.amount);
                await pool.query(`
                    INSERT INTO payments (bill_id, customer_id, amount, method, reference, collected_by, status)
                    VALUES (?, ?, ?, 'ONLINE', ?, ?, 'CONFIRMED')
                `, [bill_id, bill.customer_id, payAmount, razorpay_payment_id, req.user?.id || null]);

                const newPaid = parseFloat(bill.paid_amount || 0) + payAmount;
                const newStatus = newPaid >= parseFloat(bill.amount) ? 'PAID' : (bill.status === 'DRAFT' ? 'FINAL' : bill.status);
                await pool.query(`
                    UPDATE bills 
                    SET paid_amount = ?, status = ?, paid_at = IF(? >= amount, NOW(), paid_at)
                    WHERE id = ?
                `, [newPaid, newStatus, newPaid, bill_id]);
            }
        }

        res.json({ success: true, message: 'Payment verified successfully', payment_id: razorpay_payment_id });
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({ success: false, message: 'Payment verification failed', error: error.message });
    }
};

module.exports = { createOrder, verifyPayment };
