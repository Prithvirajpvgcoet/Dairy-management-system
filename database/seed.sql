USE dairy_db;

-- Insert Users (Passwords hashed with bcrypt: Test@1234)
INSERT INTO users (name, phone, email, password, role) VALUES 
('Admin User', '9999999999', 'admin@gmail.com', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'ADMIN'),
('Amit Customer', '8888888888', 'amit@gmail.com', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'CUSTOMER'),
('Raj Customer', '7777777777', 'raj@gmail.com', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'CUSTOMER'),
('Rahul Delivery', '6666666666', 'rahul@gmail.com', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'DELIVERY_BOY');

-- Insert Customers (Linked to user_id 2 and 3)
INSERT INTO customers (user_id, address, default_quantity, price_per_liter) VALUES 
(2, 'XYZ Society, Flat 101', 1.0, 60.00),
(3, 'ABC Society, Flat 202', 2.0, 60.00);

-- Insert Delivery Boy (Linked to user_id 4)
INSERT INTO delivery_boys (user_id, joining_date, salary_type, salary_rate) VALUES 
(4, CURDATE(), 'PER_LITER', 2.00);

-- Assign Route (Delivery Boy 1 delivers to Customer 1 and 2)
INSERT INTO delivery_routes (delivery_boy_id, customer_id) VALUES 
(1, 1),
(1, 2);
