// Try all common test passwords against admin@dairy.com
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
    const pool = mysql.createPool({ host: process.env.DB_HOST||'localhost', user: process.env.DB_USER||'root', password: process.env.DB_PASSWORD||'', database: process.env.DB_NAME||'dairy_app' });
    const [users] = await pool.query("SELECT * FROM users WHERE email IN ('admin@dairy.com','amit@gmail.com','rahul@dairy.com')");
    
    const pwdCandidates = ['admin123', 'password', '123456', 'Admin@123', 'dairy123', 'admin@123', '12345678', 'admin', 'password123', 'Dairy@123', 'dairy@123'];
    
    for (const user of users) {
        console.log(`\nTrying passwords for: ${user.email} (${user.role})`);
        for (const pwd of pwdCandidates) {
            const match = await bcrypt.compare(pwd, user.password);
            if (match) {
                console.log(`  ✅ PASSWORD FOUND: "${pwd}"`);
                break;
            }
        }
    }
    process.exit(0);
}
run().catch(console.error);
