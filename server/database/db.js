const mysql = require('mysql2/promise');
require('dotenv').config();
const bcrypt = require('bcryptjs');

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

// Get user by username (userID)
async function getUserByUsername(username) {
  try {
    const [rows] = await pool.execute('SELECT * FROM users WHERE userID = ?', [username]);
    return rows[0] || null;
  } catch (error) {
    console.error('Error finding user:', error);
    return null;
  }
}

// Get user with role-specific info
async function getUserWithRoleInfo(userID) {
  try {
    // First get the base user info
    const [userRows] = await pool.execute('SELECT * FROM users WHERE userID = ?', [userID]);
    
    if (!userRows[0]) return null;
    
    const user = userRows[0];
    
    // Then get the role-specific info
    if (user.role === 'admin') {
      const [adminRows] = await pool.execute('SELECT * FROM admins WHERE userID = ?', [userID]);
      if (adminRows[0]) {
        return { ...user, ...adminRows[0] };
      }
    } else if (user.role === 'student') {
      const [studentRows] = await pool.execute('SELECT * FROM students WHERE userID = ?', [userID]);
      if (studentRows[0]) {
        return { ...user, ...studentRows[0] };
      }
    }
    
    return user;
  } catch (error) {
    console.error('Error finding user with role info:', error);
    return null;
  }
}

// Create test users if they don't exist
async function createTestUsers() {
  try {
    // Check if admin user exists
    const adminExists = await getUserByUsername('admin001');
    if (!adminExists) {
      // Use a lower cost factor (8) for bcrypt to generate shorter hashes
      const adminPassword = await bcrypt.hash('admin123', 8);
      await pool.execute(
        'INSERT INTO users (userID, name, role, email, phone, password) VALUES (?, ?, ?, ?, ?, ?)',
        ['admin001', 'System Administrator', 'admin', 'admin@example.com', '123-456-7890', adminPassword]
      );
      
      await pool.execute(
        'INSERT INTO admins (userID, designation, researchArea) VALUES (?, ?, ?)',
        ['admin001', 'Head Administrator', 'System Security']
      );
      
      console.log('Created admin test user');
    } else {
      // Update the existing admin password for testing
      const adminPassword = await bcrypt.hash('admin123', 8);
      await pool.execute(
        'UPDATE users SET password = ? WHERE userID = ?',
        [adminPassword, 'admin001']
      );
      console.log('Updated admin test user password');
    }
    
    // Check if student user exists
    const userExists = await getUserByUsername('student001');
    if (!userExists) {
      const userPassword = await bcrypt.hash('user123', 8);
      await pool.execute(
        'INSERT INTO users (userID, name, role, email, phone, password) VALUES (?, ?, ?, ?, ?, ?)',
        ['student001', 'Alex Martinez', 'student', 'alex@example.com', '987-654-3210', userPassword]
      );
      
      await pool.execute(
        'INSERT INTO students (userID, department, year) VALUES (?, ?, ?)',
        ['student001', 'Computer Science', 3]
      );
      
      console.log('Created student test user');
    } else {
      // Update the existing student password for testing
      const userPassword = await bcrypt.hash('user123', 8);
      await pool.execute(
        'UPDATE users SET password = ? WHERE userID = ?',
        [userPassword, 'student001']
      );
      console.log('Updated student test user password');
    }
    
    // Create additional dummy users for testing if they don't exist
    const testUserCount = await countUsers();
    if (testUserCount < 15) {
      console.log('Creating additional test users...');
      await createDummyUsers();
    }
    
    return true;
  } catch (error) {
    console.error('Error creating test users:', error);
    return false;
  }
}

// Count users in the database
async function countUsers() {
  try {
    const [rows] = await pool.execute('SELECT COUNT(*) as count FROM users');
    return rows[0].count;
  } catch (error) {
    console.error('Error counting users:', error);
    return 0;
  }
}

// Create dummy users for testing
async function createDummyUsers() {
  try {
    const dummyUsers = [
      { userID: 'student011', name: 'Emma Johnson', role: 'student', email: 'emma@example.com', department: 'Computer Science', year: 2 },
      { userID: 'student012', name: 'Noah Williams', role: 'student', email: 'noah@example.com', department: 'Physics', year: 3 },
      { userID: 'student013', name: 'Olivia Brown', role: 'student', email: 'olivia@example.com', department: 'Mathematics', year: 1 },
      { userID: 'student014', name: 'Liam Jones', role: 'student', email: 'liam@example.com', department: 'Engineering', year: 4 },
      { userID: 'student015', name: 'Ava Miller', role: 'student', email: 'ava@example.com', department: 'Chemistry', year: 2 },
      { userID: 'admin004', name: 'Isabella Martinez', role: 'admin', email: 'isabella@example.com', designation: 'Security Admin', researchArea: 'Cybersecurity' },
      { userID: 'admin005', name: 'Ethan Wilson', role: 'admin', email: 'ethan@example.com', designation: 'Network Admin', researchArea: 'Network Architecture' }
    ];
    
    const password = await bcrypt.hash('password123', 8);
    
    for (const user of dummyUsers) {
      // Check if user already exists
      const userExists = await getUserByUsername(user.userID);
      if (!userExists) {
        // Insert into users table
        await pool.execute(
          'INSERT INTO users (userID, name, role, email, password) VALUES (?, ?, ?, ?, ?)',
          [user.userID, user.name, user.role, user.email, password]
        );
        
        // Insert role-specific data
        if (user.role === 'admin') {
          await pool.execute(
            'INSERT INTO admins (userID, designation, researchArea) VALUES (?, ?, ?)',
            [user.userID, user.designation, user.researchArea]
          );
        } else if (user.role === 'student') {
          await pool.execute(
            'INSERT INTO students (userID, department, year) VALUES (?, ?, ?)',
            [user.userID, user.department, user.year]
          );
        }
        
        console.log(`Created dummy user: ${user.userID}`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error creating dummy users:', error);
    return false;
  }
}

// Get all users with pagination and filtering
async function getUsers(limit = 20, offset = 0, role = null) {
  try {
    let query = 'SELECT u.*, ' +
                'CASE ' +
                'WHEN u.role = "admin" THEN a.designation ' +
                'WHEN u.role = "student" THEN s.department ' +
                'ELSE NULL ' +
                'END as detail ' +
                'FROM users u ' +
                'LEFT JOIN admins a ON u.userID = a.userID AND u.role = "admin" ' +
                'LEFT JOIN students s ON u.userID = s.userID AND u.role = "student" ';
    
    const params = [];
    
    if (role) {
      query += ' WHERE u.role = ?';
      params.push(role);
    }
    
    query += ' ORDER BY u.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const [rows] = await pool.execute(query, params);
    return rows;
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
  }
}

// Get all servers
async function getServers() {
  try {
    const [rows] = await pool.execute('SELECT * FROM servers ORDER BY name');
    return rows;
  } catch (error) {
    console.error('Error getting servers:', error);
    return [];
  }
}

// Get requests with pagination and filtering
async function getRequests(userID = null, limit = 20, offset = 0, status = null) {
  try {
    let query = 'SELECT r.*, u.name as userName, s.name as serverName ' +
                'FROM requests r ' +
                'JOIN users u ON r.userID = u.userID ' +
                'LEFT JOIN servers s ON r.serverID = s.serverID';
    
    const params = [];
    let conditions = [];
    
    if (userID) {
      conditions.push('r.userID = ?');
      params.push(userID);
    }
    
    if (status) {
      conditions.push('r.status = ?');
      params.push(status);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY r.timestamp DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const [rows] = await pool.execute(query, params);
    return rows;
  } catch (error) {
    console.error('Error getting requests:', error);
    return [];
  }
}

// Get wifi sessions for a user
async function getWifiSessions(userID = null, limit = 20, offset = 0) {
  try {
    let query = 'SELECT * FROM wifi_sessions';
    const params = [];
    
    if (userID) {
      query += ' WHERE userID = ?';
      params.push(userID);
    }
    
    query += ' ORDER BY loginTime DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const [rows] = await pool.execute(query, params);
    return rows;
  } catch (error) {
    console.error('Error getting wifi sessions:', error);
    return [];
  }
}

module.exports = {
  pool,
  testConnection,
  getUserByUsername,
  getUserWithRoleInfo,
  getUsers,
  getServers,
  getRequests,
  getWifiSessions,
  createTestUsers
};
