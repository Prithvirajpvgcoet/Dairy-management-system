const pool = require('./src/config/db');

const migrate = async () => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        console.log('🚀 Starting v2 migration...\n');

        // ─── STEP 1: Create subscriptions table ───────────────────────────────
        console.log('Step 1: Creating subscriptions table...');
        await conn.query(`
            CREATE TABLE IF NOT EXISTS subscriptions (
                id               INT AUTO_INCREMENT PRIMARY KEY,
                customer_id      INT NOT NULL,
                product_id       INT NOT NULL,
                quantity_per_day DECIMAL(5,2) NOT NULL,
                price_per_unit   DECIMAL(10,2) NOT NULL,
                start_date       DATE NOT NULL,
                end_date         DATE,
                status           ENUM('ACTIVE','PAUSED','CANCELLED') DEFAULT 'ACTIVE',
                billing_cycle    ENUM('MONTHLY') DEFAULT 'MONTHLY',
                delivery_address TEXT,
                created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id)  REFERENCES products(id)
            )
        `);

        // ─── STEP 2: Migrate customer_requirements → subscriptions ─────────────
        console.log('Step 2: Migrating customer_requirements → subscriptions...');
        const [existingReqs] = await conn.query(`
            SELECT cr.*, p.price_per_unit, c.address
            FROM customer_requirements cr
            JOIN products p ON cr.product_id = p.id
            JOIN customers c ON cr.customer_id = c.id
            WHERE cr.quantity > 0
        `);

        let migratedCount = 0;
        for (const req of existingReqs) {
            const [existing] = await conn.query(
                'SELECT id FROM subscriptions WHERE customer_id = ? AND product_id = ? AND status = "ACTIVE"',
                [req.customer_id, req.product_id]
            );
            if (existing.length === 0) {
                await conn.query(`
                    INSERT INTO subscriptions 
                        (customer_id, product_id, quantity_per_day, price_per_unit, start_date, delivery_address)
                    VALUES (?, ?, ?, ?, CURDATE(), ?)
                `, [req.customer_id, req.product_id, req.quantity, req.price_per_unit || 60.00, req.address]);
                migratedCount++;
            }
        }
        console.log(`   ✓ Migrated ${migratedCount} requirements as subscriptions`);

        // ─── STEP 3: Create delivery_addons table ─────────────────────────────
        console.log('Step 3: Creating delivery_addons table...');
        await conn.query(`
            CREATE TABLE IF NOT EXISTS delivery_addons (
                id               INT AUTO_INCREMENT PRIMARY KEY,
                customer_id      INT NOT NULL,
                subscription_id  INT,
                product_id       INT NOT NULL,
                delivery_date    DATE NOT NULL,
                addon_quantity   DECIMAL(5,2) NOT NULL,
                price_per_unit   DECIMAL(10,2) NOT NULL,
                total_amount     DECIMAL(10,2) NOT NULL,
                status           ENUM('PENDING','APPROVED','REJECTED','EXPIRED') DEFAULT 'APPROVED',
                created_by       INT,
                approved_by      INT,
                created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (customer_id)     REFERENCES customers(id) ON DELETE CASCADE,
                FOREIGN KEY (subscription_id) REFERENCES subscriptions(id),
                FOREIGN KEY (product_id)      REFERENCES products(id)
            )
        `);
        console.log('   ✓ delivery_addons created');

        // ─── STEP 4: delivery_skip_requests ───────────────────────────────────
        console.log('Step 4: Creating delivery_skip_requests table...');
        await conn.query(`
            CREATE TABLE IF NOT EXISTS delivery_skip_requests (
                id           INT AUTO_INCREMENT PRIMARY KEY,
                customer_id  INT NOT NULL,
                skip_date    DATE NOT NULL,
                reason       TEXT,
                status       ENUM('PENDING','APPROVED','REJECTED') DEFAULT 'APPROVED',
                created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_skip (customer_id, skip_date),
                FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
            )
        `);
        console.log('   ✓ delivery_skip_requests created');

        // ─── STEP 5: Upgrade deliveries table ─────────────────────────────────
        console.log('Step 5: Upgrading deliveries table...');
        // Add new columns if they don't exist
        const newColumns = [
            { col: 'subscription_id',    def: 'INT' },
            { col: 'addon_quantity',      def: 'DECIMAL(5,2) DEFAULT 0' },
            { col: 'expected_quantity',   def: 'DECIMAL(5,2) DEFAULT 0' },
            { col: 'actual_quantity',     def: 'DECIMAL(5,2) DEFAULT 0' },
            { col: 'skip_reason',         def: 'TEXT' },
            { col: 'exception_reason',    def: 'TEXT' },
            { col: 'delivery_timestamp',  def: 'TIMESTAMP NULL' },
            { col: 'gps_latitude',        def: 'DECIMAL(10,8)' },
            { col: 'gps_longitude',       def: 'DECIMAL(11,8)' },
            { col: 'delivery_proof_url',  def: 'VARCHAR(500)' },
            { col: 'marked_by',           def: 'INT' },
        ];

        for (const { col, def } of newColumns) {
            try {
                await conn.query(`ALTER TABLE deliveries ADD COLUMN ${col} ${def}`);
                console.log(`   ✓ Added column: ${col}`);
            } catch (e) {
                if (e.code === 'ER_DUP_FIELDNAME') {
                    console.log(`   ~ Column already exists: ${col}`);
                } else throw e;
            }
        }

        // Expand ENUM for status to include new values
        await conn.query(`
            ALTER TABLE deliveries MODIFY COLUMN status 
            ENUM('PENDING','DELIVERED','NOT_DELIVERED','CUSTOMER_SKIPPED','DELIVERY_FAILED','OTHER_EXCEPTION','MISSED','NOT_AVAILABLE')
            DEFAULT 'PENDING'
        `);
        console.log('   ✓ deliveries status ENUM expanded');

        // Backfill expected_quantity from assigned_quantity
        await conn.query(`
            UPDATE deliveries SET expected_quantity = assigned_quantity WHERE expected_quantity = 0
        `);
        // Backfill actual_quantity from delivered_quantity
        await conn.query(`
            UPDATE deliveries SET actual_quantity = delivered_quantity WHERE actual_quantity = 0
        `);
        console.log('   ✓ deliveries backfilled');

        // ─── STEP 6: billing_periods ──────────────────────────────────────────
        console.log('Step 6: Creating billing_periods table...');
        await conn.query(`
            CREATE TABLE IF NOT EXISTS billing_periods (
                id           INT AUTO_INCREMENT PRIMARY KEY,
                month        TINYINT NOT NULL,
                year         SMALLINT NOT NULL,
                status       ENUM('OPEN','CLOSED','FINALIZED') DEFAULT 'OPEN',
                closed_at    TIMESTAMP NULL,
                finalized_by INT,
                UNIQUE KEY unique_period (month, year)
            )
        `);
        // Seed current month
        const now = new Date();
        await conn.query(`
            INSERT IGNORE INTO billing_periods (month, year, status) VALUES (?, ?, 'OPEN')
        `, [now.getMonth() + 1, now.getFullYear()]);
        console.log('   ✓ billing_periods created + current month seeded');

        // ─── STEP 7: billing_ledger ───────────────────────────────────────────
        console.log('Step 7: Creating billing_ledger table...');
        await conn.query(`
            CREATE TABLE IF NOT EXISTS billing_ledger (
                id                INT AUTO_INCREMENT PRIMARY KEY,
                billing_period_id INT NOT NULL,
                customer_id       INT NOT NULL,
                delivery_id       INT,
                addon_id          INT,
                record_date       DATE NOT NULL,
                subscription_qty  DECIMAL(5,2) DEFAULT 0,
                addon_qty         DECIMAL(5,2) DEFAULT 0,
                expected_qty      DECIMAL(5,2) DEFAULT 0,
                actual_qty        DECIMAL(5,2) DEFAULT 0,
                delivery_status   VARCHAR(30),
                price_per_unit    DECIMAL(10,2) DEFAULT 0,
                billable_amount   DECIMAL(10,2) DEFAULT 0,
                is_billable       BOOLEAN DEFAULT TRUE,
                FOREIGN KEY (billing_period_id) REFERENCES billing_periods(id),
                FOREIGN KEY (customer_id)       REFERENCES customers(id)
            )
        `);
        console.log('   ✓ billing_ledger created');

        // ─── STEP 8: Upgrade bills table ──────────────────────────────────────
        console.log('Step 8: Upgrading bills table...');
        const billColumns = [
            { col: 'billing_period_id',   def: 'INT' },
            { col: 'total_days',          def: 'INT DEFAULT 0' },
            { col: 'delivered_days',      def: 'INT DEFAULT 0' },
            { col: 'skipped_days',        def: 'INT DEFAULT 0' },
            { col: 'missed_days',         def: 'INT DEFAULT 0' },
            { col: 'subscription_charge', def: 'DECIMAL(10,2) DEFAULT 0' },
            { col: 'addon_charge',        def: 'DECIMAL(10,2) DEFAULT 0' },
            { col: 'adjustments',         def: 'DECIMAL(10,2) DEFAULT 0' },
            { col: 'finalized_at',        def: 'TIMESTAMP NULL' },
            { col: 'finalized_by',        def: 'INT' },
            { col: 'paid_at',             def: 'TIMESTAMP NULL' },
            { col: 'bill_type',           def: 'VARCHAR(30) DEFAULT "SUBSCRIPTION"' },
        ];
        for (const { col, def } of billColumns) {
            try {
                await conn.query(`ALTER TABLE bills ADD COLUMN ${col} ${def}`);
                console.log(`   ✓ Added column to bills: ${col}`);
            } catch (e) {
                if (e.code === 'ER_DUP_FIELDNAME') {
                    console.log(`   ~ Column already exists: ${col}`);
                } else throw e;
            }
        }
        await conn.query(`
            ALTER TABLE bills MODIFY COLUMN status 
            ENUM('DRAFT','FINAL','PAID','PENDING','DISPUTED') DEFAULT 'DRAFT'
        `);
        console.log('   ✓ bills status ENUM expanded');

        // ─── STEP 9: audit_log ────────────────────────────────────────────────
        console.log('Step 9: Creating audit_log table...');
        await conn.query(`
            CREATE TABLE IF NOT EXISTS audit_log (
                id          INT AUTO_INCREMENT PRIMARY KEY,
                user_id     INT,
                action      VARCHAR(100) NOT NULL,
                entity_type VARCHAR(50),
                entity_id   INT,
                old_value   JSON,
                new_value   JSON,
                notes       TEXT,
                created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('   ✓ audit_log created');

        await conn.commit();
        console.log('\n✅ Migration v2 completed successfully!');

        // ─── Verification Report ──────────────────────────────────────────────
        const [subCount]  = await conn.query('SELECT COUNT(*) as c FROM subscriptions');
        const [delCount]  = await conn.query('SELECT COUNT(*) as c FROM deliveries');
        const [billCount] = await conn.query('SELECT COUNT(*) as c FROM bills');
        const [bpCount]   = await conn.query('SELECT COUNT(*) as c FROM billing_periods');
        console.log('\n📊 Verification:');
        console.log(`   subscriptions:    ${subCount[0].c} rows`);
        console.log(`   deliveries:       ${delCount[0].c} rows`);
        console.log(`   bills:            ${billCount[0].c} rows`);
        console.log(`   billing_periods:  ${bpCount[0].c} rows`);

    } catch (error) {
        await conn.rollback();
        console.error('\n❌ Migration FAILED — rolled back:', error.message);
        throw error;
    } finally {
        conn.release();
        process.exit(0);
    }
};

migrate();
