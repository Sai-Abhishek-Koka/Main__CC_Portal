
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
  full_name VARCHAR(100),
  department VARCHAR(100),
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

-- Insert admin users
INSERT INTO users (username, password, email, role, full_name, department) VALUES 
('admin', '$2a$10$kHYM0s7ywfyGDGfbXJ6I.uFu0T3eeAHPZ30yEtgYyIKK1KFWDZeC.', 'admin@example.com', 'admin', 'System Administrator', 'IT Department'),
('john.admin', '$2a$10$kHYM0s7ywfyGDGfbXJ6I.uFu0T3eeAHPZ30yEtgYyIKK1KFWDZeC.', 'john.admin@example.com', 'admin', 'John Smith', 'IT Department'),
('sarah.admin', '$2a$10$kHYM0s7ywfyGDGfbXJ6I.uFu0T3eeAHPZ30yEtgYyIKK1KFWDZeC.', 'sarah.admin@example.com', 'admin', 'Sarah Johnson', 'IT Department');

-- Insert regular users
INSERT INTO users (username, password, email, role, full_name, department) VALUES 
('user', '$2a$10$SG1J1ZBVLU.ECETQnDqm6eBejdmjgsjHZD2q1CUG07HuI5LiH50Ty', 'user@example.com', 'user', 'Regular User', 'Research'),
('alex.user', '$2a$10$SG1J1ZBVLU.ECETQnDqm6eBejdmjgsjHZD2q1CUG07HuI5LiH50Ty', 'alex@example.com', 'user', 'Alex Martinez', 'Engineering'),
('jane.user', '$2a$10$SG1J1ZBVLU.ECETQnDqm6eBejdmjgsjHZD2q1CUG07HuI5LiH50Ty', 'jane@example.com', 'user', 'Jane Wilson', 'Design'),
('mike.user', '$2a$10$SG1J1ZBVLU.ECETQnDqm6eBejdmjgsjHZD2q1CUG07HuI5LiH50Ty', 'mike@example.com', 'user', 'Mike Taylor', 'Research'),
('susan.user', '$2a$10$SG1J1ZBVLU.ECETQnDqm6eBejdmjgsjHZD2q1CUG07HuI5LiH50Ty', 'susan@example.com', 'user', 'Susan Brown', 'Marketing'),
('raj.user', '$2a$10$SG1J1ZBVLU.ECETQnDqm6eBejdmjgsjHZD2q1CUG07HuI5LiH50Ty', 'raj@example.com', 'user', 'Raj Patel', 'Engineering'),
('emily.user', '$2a$10$SG1J1ZBVLU.ECETQnDqm6eBejdmjgsjHZD2q1CUG07HuI5LiH50Ty', 'emily@example.com', 'user', 'Emily Chen', 'Finance'),
('david.user', '$2a$10$SG1J1ZBVLU.ECETQnDqm6eBejdmjgsjHZD2q1CUG07HuI5LiH50Ty', 'david@example.com', 'user', 'David Kim', 'Operations'),
('lisa.user', '$2a$10$SG1J1ZBVLU.ECETQnDqm6eBejdmjgsjHZD2q1CUG07HuI5LiH50Ty', 'lisa@example.com', 'user', 'Lisa Johnson', 'Research'),
('tom.user', '$2a$10$SG1J1ZBVLU.ECETQnDqm6eBejdmjgsjHZD2q1CUG07HuI5LiH50Ty', 'tom@example.com', 'user', 'Tom Peters', 'Engineering'),
('maria.user', '$2a$10$SG1J1ZBVLU.ECETQnDqm6eBejdmjgsjHZD2q1CUG07HuI5LiH50Ty', 'maria@example.com', 'user', 'Maria Rodriguez', 'Design'),
('james.user', '$2a$10$SG1J1ZBVLU.ECETQnDqm6eBejdmjgsjHZD2q1CUG07HuI5LiH50Ty', 'james@example.com', 'user', 'James Wilson', 'Marketing');

-- Insert sample servers
INSERT INTO servers (name, ip_address, status, os, cpu_cores, ram_gb, storage_gb, location) VALUES
('Production Server 1', '192.168.1.101', 'online', 'Ubuntu 22.04 LTS', 16, 64, 1000, 'US East'),
('Production Server 2', '192.168.1.102', 'online', 'CentOS 8', 12, 32, 500, 'US West'),
('Development Server', '192.168.1.103', 'online', 'Debian 11', 8, 16, 250, 'Europe'),
('Test Server', '192.168.1.104', 'maintenance', 'Windows Server 2019', 4, 8, 120, 'Asia'),
('Backup Server', '192.168.1.105', 'online', 'Ubuntu 20.04 LTS', 8, 32, 2000, 'US Central'),
('Analytics Server', '192.168.1.106', 'online', 'RHEL 8', 24, 128, 4000, 'US West'),
('Database Server', '192.168.1.107', 'online', 'Oracle Linux 8', 16, 64, 1000, 'Europe'),
('Cache Server', '192.168.1.108', 'online', 'Debian 10', 4, 16, 250, 'Asia'),
('Load Balancer 1', '192.168.1.109', 'online', 'Ubuntu 22.04 LTS', 8, 16, 250, 'US East'),
('Load Balancer 2', '192.168.1.110', 'online', 'Ubuntu 22.04 LTS', 8, 16, 250, 'US West');

-- Insert sample resource allocations
INSERT INTO resource_allocations (user_id, server_id, cpu_allocated, ram_allocated, storage_allocated, allocation_start, allocation_end, status) VALUES
(4, 1, 4, 16, 250, '2023-01-01 00:00:00', '2023-12-31 23:59:59', 'active'),
(5, 2, 2, 8, 100, '2023-01-15 00:00:00', '2023-07-15 23:59:59', 'active'),
(6, 3, 2, 4, 50, '2023-02-01 00:00:00', '2023-08-01 23:59:59', 'active'),
(7, 4, 1, 2, 20, '2023-03-01 00:00:00', '2023-06-01 23:59:59', 'active'),
(8, 5, 2, 8, 500, '2023-04-01 00:00:00', '2023-10-01 23:59:59', 'active'),
(9, 6, 4, 16, 200, '2023-02-15 00:00:00', '2023-08-15 23:59:59', 'active'),
(10, 7, 2, 8, 100, '2023-03-15 00:00:00', '2023-09-15 23:59:59', 'active'),
(11, 8, 1, 4, 50, '2023-05-01 00:00:00', '2023-11-01 23:59:59', 'active'),
(12, 9, 2, 4, 20, '2023-01-10 00:00:00', '2023-07-10 23:59:59', 'active'),
(4, 10, 2, 4, 50, '2023-04-15 00:00:00', '2023-10-15 23:59:59', 'active');

-- Insert sample requests
INSERT INTO requests (user_id, request_type, title, description, status) VALUES
(4, 'resource', 'Additional Storage Request', 'Need 500GB more storage for research data', 'pending'),
(5, 'access', 'VPN Access Request', 'Need VPN access for remote work', 'approved'),
(6, 'resource', 'RAM Upgrade Request', 'Need more RAM for running simulations', 'pending'),
(7, 'other', 'Software Installation', 'Request for installing MATLAB on development server', 'approved'),
(8, 'resource', 'New Server Request', 'Need a dedicated server for ML model training', 'pending'),
(9, 'access', 'Database Access', 'Request for read access to production database', 'rejected'),
(10, 'resource', 'GPU Resources', 'Need GPU resources for deep learning project', 'pending'),
(11, 'other', 'Custom Domain', 'Need a custom domain for project website', 'approved'),
(12, 'resource', 'Network Bandwidth', 'Increase bandwidth for data transfer', 'pending'),
(4, 'access', 'Admin Panel Access', 'Temporary admin access for system maintenance', 'rejected');

-- Insert sample issues
INSERT INTO issues (user_id, server_id, title, description, priority, status) VALUES
(4, 1, 'Server Connection Issue', 'Unable to SSH into the server', 'high', 'open'),
(5, 2, 'Slow Response Time', 'Server responding very slowly to requests', 'medium', 'in_progress'),
(6, 3, 'Database Connection Failure', 'Application cannot connect to database', 'critical', 'open'),
(7, 4, 'Storage Space Low', 'Server running out of disk space', 'medium', 'in_progress'),
(8, 5, 'Backup Failure', 'Daily backup job failing consistently', 'high', 'open'),
(9, 6, 'Memory Leak', 'Suspected memory leak in application', 'high', 'in_progress'),
(10, 7, 'Network Timeout', 'Frequent network timeouts between servers', 'medium', 'open'),
(11, 8, 'CPU Throttling', 'CPU performance drops significantly under load', 'low', 'open'),
(12, 9, 'SSL Certificate Expired', 'SSL certificate needs renewal', 'high', 'resolved'),
(4, 10, 'Load Balancer Issue', 'Load balancer not distributing traffic properly', 'medium', 'in_progress');

