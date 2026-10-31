const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Look for .env in current directory, then in backend root
const localEnvPath = path.resolve(process.cwd(), '.env');
const backendEnvPath = path.resolve(__dirname, '../../.env');

if (fs.existsSync(localEnvPath)) {
    dotenv.config({ path: localEnvPath });
} else if (fs.existsSync(backendEnvPath)) {
    dotenv.config({ path: backendEnvPath });
} else {
    dotenv.config();
}

const required = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET'];
const missing = required.filter(k => !process.env[k]);
if (missing.length) {
    console.error('Missing required env variables: ' + missing.join(', '));
    process.exit(1);
}

module.exports = {
    PORT: process.env.PORT || 5000,
    DB_HOST: process.env.DB_HOST,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME,
    JWT_SECRET: process.env.JWT_SECRET,
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
    NODE_ENV: process.env.NODE_ENV || 'development'
};
