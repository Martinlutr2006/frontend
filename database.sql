-- Database: SIMS
CREATE DATABASE IF NOT EXISTS SIMS;
USE SIMS;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS service_packages;
DROP TABLE IF EXISTS packages;
DROP TABLE IF EXISTS cars;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS salaries;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS service_records;

-- Create users table
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create cars table
CREATE TABLE cars (
    plate_number VARCHAR(20) PRIMARY KEY,
    car_type VARCHAR(50) NOT NULL,
    car_size VARCHAR(20) NOT NULL,
    driver_name VARCHAR(100) NOT NULL,
    driver_phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create packages table
CREATE TABLE packages (
    package_number INT PRIMARY KEY AUTO_INCREMENT,
    package_name VARCHAR(100) NOT NULL,
    package_description TEXT,
    package_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create service_packages table
CREATE TABLE service_packages (
    record_number INT PRIMARY KEY AUTO_INCREMENT,
    service_date DATETIME NOT NULL,
    package_number INT NOT NULL,
    plate_number VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (package_number) REFERENCES packages(package_number),
    FOREIGN KEY (plate_number) REFERENCES cars(plate_number)
);

-- Create payments table
CREATE TABLE payments (
    payment_number INT PRIMARY KEY AUTO_INCREMENT,
    amount_paid DECIMAL(10,2) NOT NULL,
    payment_date DATETIME NOT NULL,
    record_number INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (record_number) REFERENCES service_packages(record_number)
);

-- Spare_Part table
CREATE TABLE IF NOT EXISTS Spare_Part (
    spare_part_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Stock_In table
CREATE TABLE IF NOT EXISTS Stock_In (
    stock_in_id INT PRIMARY KEY AUTO_INCREMENT,
    spare_part_id INT NOT NULL,
    stock_in_quantity INT NOT NULL,
    stock_in_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (spare_part_id) REFERENCES Spare_Part(spare_part_id)
);

-- Stock_Out table
CREATE TABLE IF NOT EXISTS Stock_Out (
    stock_out_id INT PRIMARY KEY AUTO_INCREMENT,
    spare_part_id INT NOT NULL,
    stock_out_quantity INT NOT NULL,
    stock_out_unit_price DECIMAL(10,2) NOT NULL,
    stock_out_total_price DECIMAL(10,2) NOT NULL,
    stock_out_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (spare_part_id) REFERENCES Spare_Part(spare_part_id)
);

-- Users table for authentication
CREATE TABLE IF NOT EXISTS Users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user (password: admin123)
INSERT INTO Users (username, password, role) 
VALUES ('admin', '$2b$10$YourHashedPasswordHere', 'admin');

-- Insert some sample packages
INSERT INTO packages (package_name, package_description, package_price) VALUES
('Basic Wash', 'Exterior wash and vacuum', 50.00),
('Premium Wash', 'Exterior wash, vacuum, and interior cleaning', 100.00),
('Deluxe Wash', 'Full service including wax and polish', 150.00);

-- Insert some sample cars
INSERT INTO cars (plate_number, car_type, car_size, driver_name, driver_phone) VALUES
('ABC123', 'Sedan', 'Medium', 'John Doe', '1234567890'),
('XYZ789', 'SUV', 'Large', 'Jane Smith', '0987654321');