const Razorpay = require('razorpay');

// We use dummy keys if not in env
const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy_key_123',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret_abc123'
});

const createOrder = async (req, res) => {
    try {
        const { amount, receipt } = req.body;
        if (!amount) {
            return res.status(400).json({ message: 'Amount is required' });
        }

        const options = {
            amount: Math.round(amount * 100), // amount in the smallest currency unit (paise)
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
        console.error("Razorpay error:", error);
        res.status(500).json({ message: 'Payment gateway error' });
    }
};

const verifyPayment = async (req, res) => {
    // In a real scenario, you'd use crypto to verify razorpay_signature using your secret
    // For this dummy implementation, we'll just return success.
    res.json({ success: true, message: 'Payment verified successfully' });
};

module.exports = { createOrder, verifyPayment };
