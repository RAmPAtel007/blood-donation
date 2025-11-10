-- Blood Donation Management System Database
-- This file contains SQL queries to setup the database

-- Create database
CREATE DATABASE IF NOT EXISTS blooddb;

-- Use the database
USE blooddb;

-- ========================================
-- Table 1: Donors Table
-- Stores information about blood donors
-- ========================================
CREATE TABLE IF NOT EXISTS donors (
  donor_id INT AUTO_INCREMENT PRIMARY KEY,    -- Unique donor ID
  name VARCHAR(50) NOT NULL,                  -- Donor name
  age INT NOT NULL,                           -- Donor age
  gender VARCHAR(10) NOT NULL,                -- Gender (Male/Female/Other)
  blood_group VARCHAR(5) NOT NULL,            -- Blood group (A+, B+, O-, etc.)
  city VARCHAR(30) NOT NULL,                  -- City
  phone VARCHAR(15) NOT NULL,                 -- Contact number
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Registration date
);

-- ========================================
-- Table 2: Blood Requests Table
-- Stores blood requirement requests
-- ========================================
CREATE TABLE IF NOT EXISTS blood_requests (
  req_id INT AUTO_INCREMENT PRIMARY KEY,      -- Unique request ID
  name VARCHAR(50) NOT NULL,                  -- Requester name
  blood_group VARCHAR(5) NOT NULL,            -- Required blood group
  city VARCHAR(30) NOT NULL,                  -- City
  reason VARCHAR(100) NOT NULL,               -- Reason for blood requirement
  phone VARCHAR(15) NOT NULL,                 -- Contact number
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Request date
);

-- ========================================
-- Insert Sample Data (Optional - for testing)
-- ========================================
INSERT INTO donors (name, age, gender, blood_group, city, phone) VALUES
('John Doe', 25, 'Male', 'A+', 'Mumbai', '9876543210'),
('Jane Smith', 30, 'Female', 'B+', 'Delhi', '9876543211'),
('Mike Johnson', 28, 'Male', 'O+', 'Bangalore', '9876543212'),
('Sarah Williams', 27, 'Female', 'AB+', 'Chennai', '9876543213'),
('David Brown', 32, 'Male', 'O-', 'Kolkata', '9876543214');

-- Display all tables
SHOW TABLES;

-- Display donor table structure
DESCRIBE donors;

-- Display blood_requests table structure
DESCRIBE blood_requests;