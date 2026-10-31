-- Migration 006: Phase 5 - Public Website, Plans, FAQs, and Contact Messages
-- Idempotent schema additions for public website & subscription conversion flow

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Extend products table with public catalog metadata
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS category VARCHAR(40) NOT NULL DEFAULT 'Other',
  ADD COLUMN IF NOT EXISTS image_url VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS description VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS is_active TINYINT(1) NOT NULL DEFAULT 1;

-- 1b. Extend customers table with preferred delivery slot
ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS delivery_slot VARCHAR(50) DEFAULT '5:30 AM - 7:00 AM';

-- 2. Update existing products with real category and description
UPDATE products SET 
  category = 'Milk',
  image_url = 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop',
  description = 'Farm-fresh pasteurized cow milk, naturally rich in calcium, vitamin D, and essential proteins.'
WHERE name = 'Cow Milk';

UPDATE products SET 
  category = 'Milk',
  image_url = 'https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?w=600&auto=format&fit=crop',
  description = 'Rich and creamy farm buffalo milk with high fat content, perfect for traditional tea, coffee, and sweets.'
WHERE name = 'Buffalo Milk';

UPDATE products SET 
  category = 'Curd and Yogurt',
  image_url = 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&auto=format&fit=crop',
  description = 'Thick and velvety natural dahi prepared fresh daily with active gut-friendly probiotic cultures.'
WHERE name = 'Curd';

UPDATE products SET 
  category = 'Paneer',
  image_url = 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop',
  description = 'Artisanal fresh malai paneer crafted from whole milk, ultra-soft texture with 18g protein per serving.'
WHERE name = 'Paneer';

UPDATE products SET 
  category = 'Ghee',
  image_url = 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600&auto=format&fit=crop',
  description = 'Traditional bilona churned pure cow ghee with golden granulations and irresistible nutty aroma.'
WHERE name = 'Ghee';

-- Add Butter & Flavoured milk if not present
INSERT IGNORE INTO products (id, name, unit, price_per_unit, icon, in_stock, category, image_url, description, is_active)
VALUES 
(6, 'Salted Table Butter', '100 g', 58.00, '🧈', 1, 'Butter', 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600&auto=format&fit=crop', 'Golden churned butter with a hint of natural sea salt.', 1),
(7, 'Masala Buttermilk (Taak)', '500 ml', 25.00, '🥛', 1, 'Flavoured', 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=600&auto=format&fit=crop', 'Refreshing spiced buttermilk with roasted cumin, fresh coriander, and ginger.', 1);

-- 3. Subscription Plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(60) NOT NULL,
  tagline VARCHAR(120),
  is_popular TINYINT(1) DEFAULT 0,
  is_custom TINYINT(1) DEFAULT 0,
  monthly_price_override DECIMAL(10,2) NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Subscription Plan Items table
CREATE TABLE IF NOT EXISTS subscription_plan_items (
  plan_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity_per_day DECIMAL(5,2) NOT NULL,
  PRIMARY KEY (plan_id, product_id),
  FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Seed subscription plans
INSERT INTO subscription_plans (id, name, tagline, is_popular, is_custom, sort_order)
VALUES 
(1, 'Starter Cow Milk', '1 Litre pure cow milk daily — ideal for small households and fitness enthusiasts.', 0, 0, 1),
(2, 'Family Classic', '1L Cow Milk + 1L Buffalo Milk daily — our most loved complete morning combo.', 1, 0, 2),
(3, 'Premium Wellness', '2L Cow Milk + 500g Fresh Curd daily — wholesome nutrition for healthy active families.', 0, 0, 3),
(4, 'Custom Subscription', 'Design your own recurring plan with your preferred quantities and delivery schedules.', 0, 1, 4)
ON DUPLICATE KEY UPDATE name=VALUES(name), tagline=VALUES(tagline), is_popular=VALUES(is_popular), is_custom=VALUES(is_custom);

-- Seed items for predefined plans
INSERT INTO subscription_plan_items (plan_id, product_id, quantity_per_day)
VALUES
(1, 1, 1.00), -- 1L Cow Milk
(2, 1, 1.00), -- 1L Cow Milk
(2, 2, 1.00), -- 1L Buffalo Milk
(3, 1, 2.00), -- 2L Cow Milk
(3, 3, 1.00)  -- 1 Pack Curd (500g)
ON DUPLICATE KEY UPDATE quantity_per_day=VALUES(quantity_per_day);

-- 5. Contact Messages Table (Kind: CONTACT, FEEDBACK, GRIEVANCE)
CREATE TABLE IF NOT EXISTS contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kind ENUM('CONTACT','FEEDBACK','GRIEVANCE') NOT NULL DEFAULT 'CONTACT',
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('NEW','IN_PROGRESS','CLOSED') DEFAULT 'NEW',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. FAQs Table
CREATE TABLE IF NOT EXISTS faqs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question VARCHAR(255) NOT NULL,
  answer TEXT NOT NULL,
  sort_order INT DEFAULT 0
);

-- Seed FAQs
INSERT INTO faqs (id, question, answer, sort_order)
VALUES
(1, 'What time will my morning milk be delivered?', 'All morning subscriptions in Pune are delivered between 5:30 AM and 7:00 AM directly to your doorstep in temperature-insulated crates.', 1),
(2, 'How do I pause or skip delivery when traveling?', 'You can pause your subscription or skip specific dates with a single tap in your Customer Portal under "Manage Delivery" up to 10:00 PM the night before.', 2),
(3, 'How does monthly billing work?', 'Bills are calculated strictly on what was actually delivered to your doorstep (actual quantity x unit price). Your monthly invoice is generated on the 1st of every month and can be paid via UPI, Cards, or Net Banking.', 3),
(4, 'Where does Amarale Dairy source its milk?', 'We source 100% farm-fresh milk from our partnered dairy farmers in Kothrud, Mulshi, and Purandar. Milk is chilled to 4°C within 60 minutes of milking.', 4),
(5, 'Can I customize my daily products and quantities?', 'Yes! You can choose our Custom Subscription plan or modify your daily requirements directly from your account dashboard anytime.', 5),
(6, 'What quality tests are performed on the milk?', 'Every batch undergoes a rigorous 24-point laboratory test checking for zero adulteration, correct fat/SNF ratios, microbial safety, and zero chemical preservatives.', 6)
ON DUPLICATE KEY UPDATE question=VALUES(question), answer=VALUES(answer);

-- 7. Record migration
CREATE TABLE IF NOT EXISTS schema_migrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) NOT NULL UNIQUE,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT IGNORE INTO schema_migrations (filename) VALUES ('006_phase5_public_and_plans.sql');

SET FOREIGN_KEY_CHECKS = 1;
