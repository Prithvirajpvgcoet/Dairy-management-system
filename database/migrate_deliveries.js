const mysql = require('mysql2/promise');

async function runMigration() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'Prxthvi@100',
            database: 'dairy_db'
        });

        await connection.query('ALTER TABLE deliveries ADD UNIQUE(customer_id, delivery_boy_id, date);');
        console.log('Migration successful');
        process.exit(0);
    } catch (e) {
        if (e.code === 'ER_ACCESS_DENIED_ERROR') {
             try {
                const connection2 = await mysql.createConnection({
                    host: 'localhost',
                    user: 'root',
                    password: '', 
                    database: 'dairy_db'
                });
                await connection2.query('ALTER TABLE deliveries ADD UNIQUE(customer_id, delivery_boy_id, date);');
                console.log('Migration successful with empty password');
                process.exit(0);
             } catch(e2) {
                 console.error('Failed with empty password too', e2);
             }
        } else if (e.code === 'ER_DUP_KEYNAME') {
             console.log('Constraint already exists');
             process.exit(0);
        } else {
             console.error('Migration failed', e);
        }
    }
}
runMigration();
