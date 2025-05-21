-- Drop database if exists and create new one
DROP DATABASE IF EXISTS cwsms;
CREATE DATABASE cwsms;
USE cwsms;

-- Drop existing tables if they exist (in correct order due to foreign key constraints)
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS service_packages;
DROP TABLE IF EXISTS packages;
DROP TABLE IF EXISTS cars;
DROP TABLE IF EXISTS users;

-- Create users table for authentication
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create cars table for vehicle information
CREATE TABLE cars (
    plate_number VARCHAR(20) PRIMARY KEY,
    car_type ENUM('Sedan', 'SUV', 'Truck', 'Van', 'Other') NOT NULL,
    car_size ENUM('Small', 'Medium', 'Large') NOT NULL,
    driver_name VARCHAR(100) NOT NULL,
    driver_phone VARCHAR(20) NOT NULL,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_driver_name (driver_name),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create packages table for wash packages
CREATE TABLE packages (
    package_number INT PRIMARY KEY AUTO_INCREMENT,
    package_name VARCHAR(100) NOT NULL,
    package_description TEXT,
    package_price DECIMAL(10,2) NOT NULL,
    duration_minutes INT NOT NULL,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_package_name (package_name),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create service_packages table for service records
CREATE TABLE service_packages (
    record_number INT PRIMARY KEY AUTO_INCREMENT,
    service_date DATETIME NOT NULL,
    package_number INT NOT NULL,
    plate_number VARCHAR(20) NOT NULL,
    status ENUM('Pending', 'In Progress', 'Completed', 'Cancelled') DEFAULT 'Pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (package_number) REFERENCES packages(package_number) ON DELETE CASCADE,
    FOREIGN KEY (plate_number) REFERENCES cars(plate_number) ON DELETE CASCADE,
    INDEX idx_service_date (service_date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create payments table for payment records
CREATE TABLE payments (
    payment_number INT PRIMARY KEY AUTO_INCREMENT,
    amount_paid DECIMAL(10,2) NOT NULL,
    payment_date DATETIME NOT NULL,
    record_number INT NOT NULL,
    payment_method ENUM('Cash', 'Credit Card', 'Debit Card', 'Mobile Payment') NOT NULL,
    payment_status ENUM('Pending', 'Completed', 'Failed', 'Refunded') DEFAULT 'Pending',
    transaction_id VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (record_number) REFERENCES service_packages(record_number) ON DELETE CASCADE,
    INDEX idx_payment_date (payment_date),
    INDEX idx_payment_status (payment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user (password: admin123)
INSERT INTO users (username, password, role) VALUES 
('admin', '$2b$10$8K1p/a0dR1U5bQYz8K1p/eK1p/a0dR1U5bQYz8K1p/a0dR1U5bQYz8K1', 'admin');

-- Insert sample packages
INSERT INTO packages (package_name, package_description, package_price, duration_minutes) VALUES
('Basic Wash', 'Exterior wash and vacuum cleaning', 50.00, 30),
('Premium Wash', 'Exterior wash, vacuum, and interior cleaning with air freshener', 100.00, 60),
('Deluxe Wash', 'Full service including wax, polish, and premium interior cleaning', 150.00, 90),
('Express Wash', 'Quick exterior wash and basic vacuum', 30.00, 15),
('SUV Special', 'Complete wash package designed for SUVs and larger vehicles', 120.00, 75);

-- Insert sample cars
INSERT INTO cars (plate_number, car_type, car_size, driver_name, driver_phone) VALUES
('ABC123', 'Sedan', 'Medium', 'John Doe', '1234567890'),
('XYZ789', 'SUV', 'Large', 'Jane Smith', '0987654321'),
('DEF456', 'Sedan', 'Small', 'Mike Johnson', '5551234567'),
('GHI789', 'Truck', 'Large', 'Sarah Wilson', '5559876543'),
('JKL012', 'Van', 'Large', 'Robert Brown', '5554567890');

-- Insert sample service packages
INSERT INTO service_packages (service_date, package_number, plate_number, status) VALUES
(NOW(), 1, 'ABC123', 'Completed'),
(DATE_SUB(NOW(), INTERVAL 1 DAY), 2, 'XYZ789', 'Completed'),
(DATE_SUB(NOW(), INTERVAL 2 DAY), 3, 'DEF456', 'Completed'),
(DATE_SUB(NOW(), INTERVAL 3 DAY), 4, 'GHI789', 'Completed'),
(DATE_SUB(NOW(), INTERVAL 4 DAY), 5, 'JKL012', 'Completed');

-- Insert sample payments
INSERT INTO payments (amount_paid, payment_date, record_number, payment_method, payment_status) VALUES
(50.00, NOW(), 1, 'Cash', 'Completed'),
(100.00, DATE_SUB(NOW(), INTERVAL 1 DAY), 2, 'Credit Card', 'Completed'),
(150.00, DATE_SUB(NOW(), INTERVAL 2 DAY), 3, 'Debit Card', 'Completed'),
(30.00, DATE_SUB(NOW(), INTERVAL 3 DAY), 4, 'Cash', 'Completed'),
(120.00, DATE_SUB(NOW(), INTERVAL 4 DAY), 5, 'Mobile Payment', 'Completed'); 