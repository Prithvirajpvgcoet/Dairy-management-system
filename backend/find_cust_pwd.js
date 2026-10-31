const bcryptjs = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();
async function run() {
    const pool = mysql.createPool({ host: process.env.DB_HOST||'localhost', user: process.env.DB_USER||'root', password: process.env.DB_PASSWORD||'', database: process.env.DB_NAME||'dairy_app' });
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', ['amit@gmail.com']);
    const candidates = ['123456','amit123','customer','password','amit@123','dairy123','12345678','Amit@123','password123'];
    console.log('Checking', users[0].email);
    for (const pwd of candidates) {
        const m = await bcryptjs.compare(pwd, users[0].password);
        if (m) { console.log('FOUND:', pwd); break; }
    }
    console.log('Done');
    process.exit(0);
}
run();
