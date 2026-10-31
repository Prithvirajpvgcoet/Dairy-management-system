const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateToken = (userId, role) => {
    return jwt.sign({ id: userId, role: role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

module.exports = { generateToken };