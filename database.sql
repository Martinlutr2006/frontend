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

-- Insert default admin user (password: admin123)
INSERT INTO users (username, password) VALUES 
('admin', '$2b$10$8K1p/a0dR1U5bQYz8K1p/eK1p/a0dR1U5bQYz8K1p/a0dR1U5bQYz8K1');

-- Insert some sample packages
INSERT INTO packages (package_name, package_description, package_price) VALUES
('Basic Wash', 'Exterior wash and vacuum', 50.00),
('Premium Wash', 'Exterior wash, vacuum, and interior cleaning', 100.00),
('Deluxe Wash', 'Full service including wax and polish', 150.00);

-- Insert some sample cars
INSERT INTO cars (plate_number, car_type, car_size, driver_name, driver_phone) VALUES
('ABC123', 'Sedan', 'Medium', 'John Doe', '1234567890'),
('XYZ789', 'SUV', 'Large', 'Jane Smith', '0987654321');