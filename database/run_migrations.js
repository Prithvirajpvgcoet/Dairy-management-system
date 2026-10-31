const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('../backend/src/config/env');

async function runMigrations() {
    console.log('Connecting to database:', process.env.DB_NAME);
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        multipleStatements: true,
        timezone: '+05:30'
    });

    try {
        // 1. Create schema_migrations table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS schema_migrations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                filename VARCHAR(255) NOT NULL UNIQUE,
                applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 2. Read all files in database/migrations/
        const migrationsDir = path.resolve(__dirname, 'migrations');
        if (!fs.existsSync(migrationsDir)) {
            console.log('No migrations directory found.');
            return;
        }

        const files = fs.readdirSync(migrationsDir)
            .filter(f => f.endsWith('.sql'))
            .sort();

        // 3. Fetch already applied migrations
        const [appliedRows] = await connection.query('SELECT filename FROM schema_migrations');
        const appliedSet = new Set(appliedRows.map(r => r.filename));

        for (const file of files) {
            if (appliedSet.has(file)) {
                console.log(`⏩ [Skipping] ${file} (already applied)`);
                continue;
            }

            console.log(`🚀 [Applying] ${file}...`);
            const sqlContent = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');

            await connection.query(sqlContent);
            await connection.query('INSERT INTO schema_migrations (filename) VALUES (?)', [file]);
            console.log(`✅ [Applied]  ${file}`);
        }

        console.log('\n🎉 All migrations executed successfully!');
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

runMigrations();
