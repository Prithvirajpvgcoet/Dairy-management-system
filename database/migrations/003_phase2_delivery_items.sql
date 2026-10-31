-- 003_phase2_delivery_items.sql
-- Create delivery_items table for multi-product daily delivery tracking with frozen prices

CREATE TABLE IF NOT EXISTS delivery_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  delivery_id INT NOT NULL,
  product_id INT NOT NULL,
  subscription_qty DECIMAL(6,2) NOT NULL DEFAULT 0,
  addon_qty DECIMAL(6,2) NOT NULL DEFAULT 0,
  expected_qty DECIMAL(6,2) NOT NULL DEFAULT 0,
  actual_qty DECIMAL(6,2) NOT NULL DEFAULT 0,
  price_per_unit DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (delivery_id) REFERENCES deliveries(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id),
  UNIQUE KEY uq_item (delivery_id, product_id)
);
