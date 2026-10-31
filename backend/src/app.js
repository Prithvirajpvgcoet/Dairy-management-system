require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Import routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const customerRoutes = require('./routes/customerRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const publicRoutes = require('./routes/publicRoutes');
const publicController = require('./controllers/publicController');

const app = express();

// Security Hardening
app.set('trust proxy', 1);
app.use(helmet({ 
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

// Middlewares
app.use(cors({ 
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', 
    credentials: true 
}));
app.use(express.json({ limit: '100kb' })); // Body size limited to 100kb against payload flooding

// Public endpoints aliases
app.get('/api/products', publicController.getProducts);
app.get('/api/plans', publicController.getPlans);
app.get('/api/faqs', publicController.getFaqs);
app.post('/api/contact', publicController.submitContact);
app.get('/api/track-order/:query', publicController.trackOrder);

// Mount Routes
app.use('/api/public', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check route
app.get('/', (req, res) => {
    res.send('Dairy Management API is running...');
});

// Global standardized error handling middleware
app.use((err, req, res, next) => {
    // If payload exceeds limit
    if (err.type === 'entity.too.large') {
        return res.status(413).json({
            message: 'Payload too large. Maximum allowed request body size is 100kb.',
            code: 'PAYLOAD_TOO_LARGE'
        });
    }

    console.error('Unhandled Application Error:', err);
    const status = err.status || err.statusCode || 500;
    res.status(status).json({
        message: err.message || 'Internal server error',
        code: err.code || 'INTERNAL_ERROR'
    });
});

module.exports = app;
