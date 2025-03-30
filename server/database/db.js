
const mysql = require('mysql2/promise');
require('dotenv').config();

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'command_center',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection established successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Get user by username
async function getUserByUsername(username) {
  try {
    const [rows] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0] || null;
  } catch (error) {
    console.error('Error finding user:', error);
    return null;
  }
}

// Create test users if they don't exist
async function createTestUsers() {
  try {
    const bcrypt = require('bcryptjs');
    
    // Check if admin user exists
    const adminExists = await getUserByUsername('admin');
    if (!adminExists) {
      const adminPassword = await bcrypt.hash('admin123', 10);
      await pool.execute(
        'INSERT INTO users (username, password, email, role, full_name, department) VALUES (?, ?, ?, ?, ?, ?)',
        ['admin', adminPassword, 'admin@example.com', 'admin', 'Admin User', 'IT']
      );
      console.log('Created admin test user');
    }
    
    // Check if regular user exists
    const userExists = await getUserByUsername('user');
    if (!userExists) {
      const userPassword = await bcrypt.hash('user123', 10);
      await pool.execute(
        'INSERT INTO users (username, password, email, role, full_name, department) VALUES (?, ?, ?, ?, ?, ?)',
        ['user', userPassword, 'user@example.com', 'user', 'Regular User', 'Engineering']
      );
      console.log('Created regular test user');
    }
    
    return true;
  } catch (error) {
    console.error('Error creating test users:', error);
    return false;
  }
}

// Get all users with pagination and filtering
async function getUsers(limit = 20, offset = 0, role = null) {
  try {
    let query = 'SELECT id, username, email, role, full_name, department, created_at, updated_at FROM users';
    const params = [];
    
    if (role) {
      query += ' WHERE role = ?';
      params.push(role);
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const [rows] = await pool.execute(query, params);
    return rows;
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
  }
}

module.exports = {
  pool,
  testConnection,
  getUserByUsername,
  getUsers,
  createTestUsers
};
