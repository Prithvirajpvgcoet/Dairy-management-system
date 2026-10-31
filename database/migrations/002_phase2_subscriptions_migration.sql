-- 002_phase2_subscriptions_migration.sql
-- Synchronize active customer_requirements into subscriptions table as single source of truth

INSERT INTO subscriptions (customer_id, product_id, quantity_per_day, price_per_unit, start_date, status)
SELECT 
    cr.customer_id,
    cr.product_id,
    cr.quantity,
    p.price_per_unit,
    CURDATE(),
    'ACTIVE'
FROM customer_requirements cr
JOIN products p ON cr.product_id = p.id
WHERE cr.quantity > 0
  AND NOT EXISTS (
      SELECT 1 FROM subscriptions s
      WHERE s.customer_id = cr.customer_id
        AND s.product_id = cr.product_id
        AND s.status = 'ACTIVE'
  );
