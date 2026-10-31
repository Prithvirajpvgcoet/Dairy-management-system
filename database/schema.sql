CREATE DATABASE IF NOT EXISTS dairy_db;
USE dairy_db;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'CUSTOMER', 'DELIVERY_BOY') NOT NULL,
    status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    address TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    price_per_unit DECIMAL(10,2) NOT NULL,
    icon VARCHAR(50) DEFAULT '📦',
    in_stock BOOLEAN DEFAULT TRUE
);

CREATE TABLE customer_requirements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity DECIMAL(5,2) DEFAULT 0,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE(customer_id, product_id)
);

CREATE TABLE delivery_boys (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    joining_date DATE,
    salary_type ENUM('FIXED', 'PER_LITER', 'FIXED_PLUS_INCENTIVE') DEFAULT 'FIXED',
    salary_rate DECIMAL(10,2),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE customer_availability (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    date DATE NOT NULL,
    required_quantity DECIMAL(5,2),
    available BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE TABLE inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    total_available DECIMAL(10,2) NOT NULL
);

CREATE TABLE delivery_routes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    delivery_boy_id INT NOT NULL,
    customer_id INT NOT NULL,
    FOREIGN KEY (delivery_boy_id) REFERENCES delivery_boys(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE TABLE deliveries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    delivery_boy_id INT NOT NULL,
    date DATE NOT NULL,
    assigned_quantity DECIMAL(5,2) NOT NULL,
    delivered_quantity DECIMAL(5,2),
    status ENUM('DELIVERED', 'MISSED', 'NOT_AVAILABLE', 'PENDING') DEFAULT 'PENDING',
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (delivery_boy_id) REFERENCES delivery_boys(id)
);

CREATE TABLE delivery_boy_daily (
    id INT AUTO_INCREMENT PRIMARY KEY,
    delivery_boy_id INT NOT NULL,
    date DATE NOT NULL,
    milk_taken DECIMAL(10,2),
    milk_delivered DECIMAL(10,2),
    milk_returned DECIMAL(10,2),
    FOREIGN KEY (delivery_boy_id) REFERENCES delivery_boys(id)
);

CREATE TABLE bills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    month VARCHAR(20) NOT NULL,
    year INT NOT NULL,
    total_liters DECIMAL(10,2) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    generated_date DATE,
    status ENUM('PAID', 'PENDING') DEFAULT 'PENDING',
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Seed pre-defined Admin User
INSERT IGNORE INTO users (name, phone, email, password, role) VALUES ('Super Admin', '9999999999', 'admin@dairy.com', 'admin123', 'ADMIN');