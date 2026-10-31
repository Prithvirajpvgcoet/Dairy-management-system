// Reset all user passwords to known values for testing
const bcryptjs = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();
async function run() {
    const pool = mysql.createPool({ host: process.env.DB_HOST||'localhost', user: process.env.DB_USER||'root', password: process.env.DB_PASSWORD||'', database: process.env.DB_NAME||'dairy_app' });
    
    const testPassword = 'Test@1234';
    const hash = await bcryptjs.hash(testPassword, 10);
    
    await pool.query('UPDATE users SET password = ?', [hash]);
    console.log(`All users now have password: "${testPassword}"`);
    
    const [users] = await pool.query('SELECT email, role FROM users');
    users.forEach(u => console.log(' -', u.role.padEnd(15), u.email));
    process.exit(0);
}
run();
