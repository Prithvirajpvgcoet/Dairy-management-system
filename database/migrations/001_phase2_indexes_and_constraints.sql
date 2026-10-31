-- 001_phase2_indexes_and_constraints.sql

-- Add stop_order to delivery_routes if not exists
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'delivery_routes' AND COLUMN_NAME = 'stop_order');
SET @sql := IF(@exist = 0, 'ALTER TABLE delivery_routes ADD COLUMN stop_order INT DEFAULT 0', 'SELECT "stop_order already exists"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add unique key uq_cust_date to deliveries
SET @exist := (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'deliveries' AND INDEX_NAME = 'uq_cust_date');
SET @sql := IF(@exist = 0, 'ALTER TABLE deliveries ADD UNIQUE KEY uq_cust_date (customer_id, date)', 'SELECT "uq_cust_date already exists"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add index idx_del_boy_date
SET @exist := (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'deliveries' AND INDEX_NAME = 'idx_del_boy_date');
SET @sql := IF(@exist = 0, 'CREATE INDEX idx_del_boy_date ON deliveries (delivery_boy_id, date)', 'SELECT "idx_del_boy_date exists"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add index idx_del_date_status
SET @exist := (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'deliveries' AND INDEX_NAME = 'idx_del_date_status');
SET @sql := IF(@exist = 0, 'CREATE INDEX idx_del_date_status ON deliveries (date, status)', 'SELECT "idx_del_date_status exists"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add index idx_skip_date
SET @exist := (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'delivery_skip_requests' AND INDEX_NAME = 'idx_skip_date');
SET @sql := IF(@exist = 0, 'CREATE INDEX idx_skip_date ON delivery_skip_requests (skip_date)', 'SELECT "idx_skip_date exists"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add index idx_addon_date
SET @exist := (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'delivery_addons' AND INDEX_NAME = 'idx_addon_date');
SET @sql := IF(@exist = 0, 'CREATE INDEX idx_addon_date ON delivery_addons (delivery_date, status)', 'SELECT "idx_addon_date exists"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add index idx_sub_cust
SET @exist := (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'subscriptions' AND INDEX_NAME = 'idx_sub_cust');
SET @sql := IF(@exist = 0, 'CREATE INDEX idx_sub_cust ON subscriptions (customer_id, status)', 'SELECT "idx_sub_cust exists"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add index idx_notif_user
SET @exist := (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'notifications' AND INDEX_NAME = 'idx_notif_user');
SET @sql := IF(@exist = 0, 'CREATE INDEX idx_notif_user ON notifications (user_id, is_read, created_at)', 'SELECT "idx_notif_user exists"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
