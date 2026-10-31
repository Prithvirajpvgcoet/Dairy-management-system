const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const migrate = async () => {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'dairy_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    const [users] = await pool.query('SELECT id, password FROM users');
    let count = 0;
    for (const u of users) {
      if (u.password.length < 30) { // not bcrypt-shaped
        const hashed = await bcrypt.hash(u.password, 10);
        await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashed, u.id]);
        count++;
      }
    }
    console.log(`Migration complete. Hashed ${count} plaintext password(s).`);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
};

migrate();