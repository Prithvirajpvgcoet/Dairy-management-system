-- Phase 3 Migration: Create payments table with relational constraints and indexing

CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bill_id INT NOT NULL,
  customer_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  method ENUM('CASH','UPI','CARD','WALLET','ONLINE') NOT NULL,
  reference VARCHAR(100) NULL,
  collected_by INT NULL,
  status ENUM('PENDING_CONFIRM','CONFIRMED') DEFAULT 'CONFIRMED',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_payments_bill (bill_id),
  INDEX idx_payments_customer (customer_id),
  FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);
