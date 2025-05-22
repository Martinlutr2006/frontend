-- Drop database if exists and create new one
DROP DATABASE IF EXISTS sims;
CREATE DATABASE sims;
USE sims;

-- Drop existing tables if they exist (in correct order due to foreign key constraints)
DROP TABLE IF EXISTS stock_out;
DROP TABLE IF EXISTS stock_in;
DROP TABLE IF EXISTS spare_parts;
DROP TABLE IF EXISTS users;

-- Create users table for authentication
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'stock_manager') DEFAULT 'stock_manager',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create spare_parts table
CREATE TABLE spare_parts (
    part_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_category (category),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create stock_in table
CREATE TABLE stock_in (
    stock_in_id INT PRIMARY KEY AUTO_INCREMENT,
    part_id INT NOT NULL,
    stock_in_quantity INT NOT NULL,
    stock_in_date DATETIME NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (part_id) REFERENCES spare_parts(part_id) ON DELETE CASCADE,
    INDEX idx_stock_in_date (stock_in_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create stock_out table
CREATE TABLE stock_out (
    stock_out_id INT PRIMARY KEY AUTO_INCREMENT,
    part_id INT NOT NULL,
    stock_out_quantity INT NOT NULL,
    stock_out_unit_price DECIMAL(10,2) NOT NULL,
    stock_out_total_price DECIMAL(10,2) NOT NULL,
    stock_out_date DATETIME NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (part_id) REFERENCES spare_parts(part_id) ON DELETE CASCADE,
    INDEX idx_stock_out_date (stock_out_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user (password: admin123)
INSERT INTO users (username, password, role) VALUES 
('admin', '$2b$10$8K1p/a0dR1U5bQYz8K1p/eK1p/a0dR1U5bQYz8K1p/a0dR1U5bQYz8K1', 'admin');

-- Insert sample spare parts
INSERT INTO spare_parts (name, category, quantity, unit_price, total_price) VALUES
('Brake Pads', 'Brakes', 50, 25.00, 1250.00),
('Oil Filter', 'Filters', 100, 10.00, 1000.00),
('Air Filter', 'Filters', 75, 15.00, 1125.00),
('Spark Plugs', 'Engine', 200, 5.00, 1000.00),
('Timing Belt', 'Engine', 30, 40.00, 1200.00);

-- Insert sample stock in records
INSERT INTO stock_in (part_id, stock_in_quantity, stock_in_date, unit_price, total_price) VALUES
(1, 20, NOW(), 25.00, 500.00),
(2, 50, DATE_SUB(NOW(), INTERVAL 1 DAY), 10.00, 500.00),
(3, 25, DATE_SUB(NOW(), INTERVAL 2 DAY), 15.00, 375.00),
(4, 100, DATE_SUB(NOW(), INTERVAL 3 DAY), 5.00, 500.00),
(5, 15, DATE_SUB(NOW(), INTERVAL 4 DAY), 40.00, 600.00);

-- Insert sample stock out records
INSERT INTO stock_out (part_id, stock_out_quantity, stock_out_unit_price, stock_out_total_price, stock_out_date) VALUES
(1, 5, 25.00, 125.00, NOW()),
(2, 10, 10.00, 100.00, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(3, 8, 15.00, 120.00, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(4, 20, 5.00, 100.00, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(5, 3, 40.00, 120.00, DATE_SUB(NOW(), INTERVAL 4 DAY)); 