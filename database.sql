-- Create the database
CREATE DATABASE IF NOT EXISTS crpms;
USE crpms;

-- USERS table
CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);

-- SERVICES table
CREATE TABLE services (
  service_code VARCHAR(10) PRIMARY KEY,
  service_name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL
);

-- CARS table
CREATE TABLE cars (
  platenumber VARCHAR(20) PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  model VARCHAR(50) NOT NULL,
  manufacturing_year INT NOT NULL,
  driver_phone VARCHAR(20) NOT NULL,
  mechanic_name VARCHAR(50) NOT NULL
);

-- SERVICE RECORDS table
CREATE TABLE servicerecords (
  recordnumber INT AUTO_INCREMENT PRIMARY KEY,
  servicedate DATE NOT NULL,
  platenumber VARCHAR(20) NOT NULL,
  service_code VARCHAR(10) NOT NULL,
  FOREIGN KEY (platenumber) REFERENCES cars(platenumber) ON DELETE RESTRICT,
  FOREIGN KEY (service_code) REFERENCES services(service_code) ON DELETE RESTRICT
);

-- PAYMENTS table
CREATE TABLE payments (
  paymentnumber INT AUTO_INCREMENT PRIMARY KEY,
  amount_paid DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL,
  recordnumber INT NOT NULL,
  user_id INT NOT NULL,
  FOREIGN KEY (recordnumber) REFERENCES servicerecords(recordnumber) ON DELETE RESTRICT,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT
);

-- Insert initial services data
INSERT INTO services (service_code, service_name, price) VALUES
('S001', 'Engine Repair', 150000.00),
('S002', 'Transmission Repair', 80000.00),
('S003', 'Oil Change', 60000.00),
('S004', 'Chain Replacement', 40000.00),
('S005', 'Disc Replacement', 400000.00),
('S006', 'Wheel Alignment', 5000.00);

-- Create indexes for better performance
CREATE INDEX idx_servicerecords_date ON servicerecords(servicedate);
CREATE INDEX idx_payments_date ON payments(payment_date);
CREATE INDEX idx_cars_plate ON cars(platenumber);
CREATE INDEX idx_services_code ON services(service_code);

-- Add some sample data for testing (optional)
-- Sample user (password: admin123)
INSERT INTO users (username, password) VALUES
('admin', '$2b$10$8K1p/a0dR1xqM8K3hxKJ6O9v8Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z'); -- This is a hashed password, you should use bcrypt to generate proper hashes

-- Sample cars
INSERT INTO cars (platenumber, type, model, manufacturing_year, driver_phone, mechanic_name) VALUES
('ABC123', 'Sedan', 'Toyota Camry', 2020, '0771234567', 'John Smith'),
('XYZ789', 'SUV', 'Honda CR-V', 2021, '0777654321', 'Mike Johnson'),
('DEF456', 'Hatchback', 'Volkswagen Golf', 2019, '0779876543', 'Sarah Wilson');

-- Sample service records
INSERT INTO servicerecords (servicedate, platenumber, service_code) VALUES
('2024-03-01', 'ABC123', 'S003'),
('2024-03-02', 'XYZ789', 'S001'),
('2024-03-03', 'DEF456', 'S006');

-- Sample payments
INSERT INTO payments (amount_paid, payment_date, recordnumber, user_id) VALUES
(60000.00, '2024-03-01', 1, 1),
(150000.00, '2024-03-02', 2, 1),
(5000.00, '2024-03-03', 3, 1);