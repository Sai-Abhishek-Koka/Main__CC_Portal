
-- Create the command_center database
CREATE DATABASE IF NOT EXISTS command_center;
USE command_center;

-- Create the users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100),
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create servers table for tracking server resources
CREATE TABLE IF NOT EXISTS servers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  ip_address VARCHAR(45) NOT NULL,
  status ENUM('online', 'offline', 'maintenance') DEFAULT 'offline',
  os VARCHAR(50),
  cpu_cores INT,
  ram_gb INT,
  storage_gb INT,
  location VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create resource_allocation table to track allocated resources
CREATE TABLE IF NOT EXISTS resource_allocations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  server_id INT NOT NULL,
  cpu_allocated INT,
  ram_allocated INT,
  storage_allocated INT,
  allocation_start DATETIME NOT NULL,
  allocation_end DATETIME,
  status ENUM('active', 'expired', 'cancelled') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE CASCADE
);

-- Create requests table for resource requests
CREATE TABLE IF NOT EXISTS requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  request_type ENUM('resource', 'access', 'other') NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create issues table for tracking problems
CREATE TABLE IF NOT EXISTS issues (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  server_id INT,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE SET NULL
);

-- Insert default users (admin and regular user)
INSERT INTO users (username, password, role) VALUES 
('admin', '$2a$10$kHYM0s7ywfyGDGfbXJ6I.uFu0T3eeAHPZ30yEtgYyIKK1KFWDZeC.', 'admin'), -- password: admin123 (hashed)
('user', '$2a$10$SG1J1ZBVLU.ECETQnDqm6eBejdmjgsjHZD2q1CUG07HuI5LiH50Ty', 'user');  -- password: user123 (hashed)

-- Insert sample servers
INSERT INTO servers (name, ip_address, status, os, cpu_cores, ram_gb, storage_gb, location) VALUES
('Production Server 1', '192.168.1.101', 'online', 'Ubuntu 22.04 LTS', 16, 64, 1000, 'US East'),
('Production Server 2', '192.168.1.102', 'online', 'CentOS 8', 12, 32, 500, 'US West'),
('Development Server', '192.168.1.103', 'online', 'Debian 11', 8, 16, 250, 'Europe'),
('Test Server', '192.168.1.104', 'maintenance', 'Windows Server 2019', 4, 8, 120, 'Asia');
