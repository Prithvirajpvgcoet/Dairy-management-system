-- Phase 3 Migration: Deduplicate bills, normalise month, add paid_amount and uq_bill unique constraint

-- Step 1: Deduplicate duplicate draft bills before adding constraint
DELETE b1 FROM bills b1
INNER JOIN bills b2 
  ON b1.customer_id = b2.customer_id 
  AND b1.year = b2.year 
  AND CAST(b1.month AS UNSIGNED) = CAST(b2.month AS UNSIGNED)
  AND b1.bill_type = b2.bill_type
  AND (
    (b1.status = 'DRAFT' AND b2.status IN ('PAID', 'FINAL', 'PENDING'))
    OR (b1.status = b2.status AND b1.id < b2.id)
  );

-- Step 2: Convert month to numeric representation and alter type to TINYINT
UPDATE bills SET month = CAST(month AS UNSIGNED);
ALTER TABLE bills MODIFY month TINYINT NOT NULL;

-- Step 3: Add paid_amount column if it does not already exist
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bills' AND COLUMN_NAME = 'paid_amount');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE bills ADD COLUMN paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER amount', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Initialize paid_amount = amount for already PAID bills
UPDATE bills SET paid_amount = amount WHERE status = 'PAID' AND paid_amount = 0;

-- Step 4: Add UNIQUE KEY uq_bill (customer_id, year, month, bill_type)
SET @idx_exists = (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bills' AND INDEX_NAME = 'uq_bill');
SET @sql_idx = IF(@idx_exists = 0, 'ALTER TABLE bills ADD UNIQUE KEY uq_bill (customer_id, year, month, bill_type)', 'SELECT 1');
PREPARE stmt_idx FROM @sql_idx;
EXECUTE stmt_idx;
DEALLOCATE PREPARE stmt_idx;
