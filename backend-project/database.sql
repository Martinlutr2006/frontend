-- Database: PSSMS (Parking Space Sales Management System)
CREATE DATABASE IF NOT EXISTS PSSMS;
USE PSSMS;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS parking_records;
DROP TABLE IF EXISTS cars;
DROP TABLE IF EXISTS parking_slots;
DROP TABLE IF EXISTS users;

-- Create users table for authentication
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'manager') NOT NULL DEFAULT 'manager',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create parking_slots table
CREATE TABLE parking_slots (
    slot_number VARCHAR(10) PRIMARY KEY,
    slot_status ENUM('available', 'occupied') NOT NULL DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create cars table
CREATE TABLE cars (
    plate_number VARCHAR(20) PRIMARY KEY,
    driver_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create parking_records table
CREATE TABLE parking_records (
    record_id INT PRIMARY KEY AUTO_INCREMENT,
    plate_number VARCHAR(20) NOT NULL,
    slot_number VARCHAR(10) NOT NULL,
    entry_time DATETIME NOT NULL,
    exit_time DATETIME,
    duration INT, -- Duration in minutes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plate_number) REFERENCES cars(plate_number),
    FOREIGN KEY (slot_number) REFERENCES parking_slots(slot_number)
);

-- Create payments table
CREATE TABLE payments (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    record_id INT NOT NULL,
    amount_paid DECIMAL(10,2) NOT NULL,
    payment_date DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (record_id) REFERENCES parking_records(record_id)
);

-- Insert default admin user (password: Admin@123)
-- Note: In production, use a proper password hashing mechanism
INSERT INTO users (username, password, role) 
VALUES ('admin', '$2b$10$YourHashedPasswordHere', 'admin');

-- Insert sample parking slots
INSERT INTO parking_slots (slot_number, slot_status) VALUES
('A1', 'available'),
('A2', 'available'),
('A3', 'available'),
('B1', 'available'),
('B2', 'available'),
('B3', 'available'),
('C1', 'available'),
('C2', 'available'),
('C3', 'available'),
('D1', 'available');

-- Create indexes for better query performance
CREATE INDEX idx_parking_records_entry_time ON parking_records(entry_time);
CREATE INDEX idx_parking_records_exit_time ON parking_records(exit_time);
CREATE INDEX idx_payments_payment_date ON payments(payment_date);
CREATE INDEX idx_cars_plate_number ON cars(plate_number);
CREATE INDEX idx_parking_slots_status ON parking_slots(slot_status);

-- Add comments to explain table purposes
ALTER TABLE users COMMENT = 'Stores user accounts for system access';
ALTER TABLE parking_slots COMMENT = 'Manages parking slot availability and status';
ALTER TABLE cars COMMENT = 'Stores registered car and driver information';
ALTER TABLE parking_records COMMENT = 'Tracks parking entries, exits, and duration';
ALTER TABLE payments COMMENT = 'Records parking fee payments';

-- Create view for active parking records
CREATE VIEW active_parking AS
SELECT 
    pr.record_id,
    pr.plate_number,
    c.driver_name,
    c.phone_number,
    pr.slot_number,
    pr.entry_time,
    TIMESTAMPDIFF(MINUTE, pr.entry_time, NOW()) as current_duration
FROM parking_records pr
JOIN cars c ON pr.plate_number = c.plate_number
WHERE pr.exit_time IS NULL;

-- Create view for daily revenue
CREATE VIEW daily_revenue AS
SELECT 
    DATE(p.payment_date) as payment_date,
    COUNT(*) as total_transactions,
    SUM(p.amount_paid) as total_revenue
FROM payments p
GROUP BY DATE(p.payment_date);