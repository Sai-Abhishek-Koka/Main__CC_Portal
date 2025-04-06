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
    
    // Create tables if they don't exist
    await createTables();
    
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Create necessary tables if they don't exist
async function createTables() {
  try {
    // Create users table if not exists
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userID VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        role ENUM('admin', 'student') NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone VARCHAR(20),
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create admins table if not exists
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userID VARCHAR(50) UNIQUE NOT NULL,
        designation VARCHAR(100),
        researchArea VARCHAR(100),
        FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE
      )
    `);
    
    // Create students table if not exists
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userID VARCHAR(50) UNIQUE NOT NULL,
        department VARCHAR(100),
        year INT,
        FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE
      )
    `);
    
    // Create servers table if not exists
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS servers (
        serverID VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        ip VARCHAR(50) NOT NULL,
        status ENUM('online', 'offline', 'maintenance') DEFAULT 'online',
        type VARCHAR(50),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create requests table if not exists
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS requests (
        requestID VARCHAR(50) PRIMARY KEY,
        userID VARCHAR(50) NOT NULL,
        serverID VARCHAR(50),
        type VARCHAR(50) NOT NULL,
        description TEXT,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE,
        FOREIGN KEY (serverID) REFERENCES servers(serverID) ON DELETE SET NULL
      )
    `);
    
    console.log('Tables created/verified successfully');
    
    // Check if we need to create some test servers
    const [serverRows] = await pool.execute('SELECT COUNT(*) as count FROM servers');
    if (serverRows[0].count < 1) {
      await createTestServers();
    }
    
    // Check if we need to create some test requests
    const [requestRows] = await pool.execute('SELECT COUNT(*) as count FROM requests');
    if (requestRows[0].count < 1) {
      await createTestRequests();
    }
    
    return true;
  } catch (error) {
    console.error('Error creating tables:', error);
    return false;
  }
}

// Create test servers
async function createTestServers() {
  try {
    const servers = [
      { serverID: 'srv001', name: 'Main Application Server', ip: '192.168.1.10', status: 'online', type: 'Production', description: 'Primary application server for the department' },
      { serverID: 'srv002', name: 'Database Server', ip: '192.168.1.11', status: 'online', type: 'Production', description: 'MySQL database server' },
      { serverID: 'srv003', name: 'Development Server', ip: '192.168.1.12', status: 'maintenance', type: 'Development', description: 'Server for development and testing' }
    ];
    
    for (const server of servers) {
      await pool.execute(
        'INSERT INTO servers (serverID, name, ip, status, type, description) VALUES (?, ?, ?, ?, ?, ?)',
        [server.serverID, server.name, server.ip, server.status, server.type, server.description]
      );
    }
    
    console.log('Test servers created successfully');
    return true;
  } catch (error) {
    console.error('Error creating test servers:', error);
    return false;
  }
}

// Create test requests
async function createTestRequests() {
  try {
    // Check if requests table is empty
    const [requestCount] = await pool.execute('SELECT COUNT(*) as count FROM requests');
    if (requestCount[0].count > 0) {
      console.log('Requests table already has data');
      return true;
    }
    
    // First check if users exist
    const [userRows] = await pool.execute('SELECT userID FROM users LIMIT 2');
    if (userRows.length < 2) {
      console.log('Not enough users to create test requests');
      return false;
    }
    
    // Get server IDs
    const [serverRows] = await pool.execute('SELECT serverID FROM servers LIMIT 2');
    if (serverRows.length < 1) {
      console.log('No servers available to create test requests');
      return false;
    }
    
    const requests = [
      { 
        requestID: 'req001', 
        userID: 'student001', 
        serverID: serverRows[0]?.serverID || null, 
        type: 'Access', 
        description: 'Need access to the main server for my project', 
        status: 'pending' 
      },
      { 
        requestID: 'req002', 
        userID: 'student001', 
        serverID: serverRows[0]?.serverID || null, 
        type: 'Resource', 
        description: 'Requesting additional RAM allocation for computational tasks', 
        status: 'approved' 
      },
      { 
        requestID: 'req003', 
        userID: 'student011', 
        serverID: serverRows[1]?.serverID || null, 
        type: 'Software', 
        description: 'Need to install Python 3.9 and TensorFlow for my research project', 
        status: 'rejected' 
      },
      { 
        requestID: 'req004', 
        userID: 'student011', 
        serverID: serverRows[1]?.serverID || null, 
        type: 'High', 
        description: 'Emergency access to data backup server', 
        status: 'pending' 
      },
      { 
        requestID: 'req005', 
        userID: 'student012', 
        serverID: serverRows[0]?.serverID || null, 
        type: 'Medium', 
        description: 'Request for web server hosting permissions', 
        status: 'pending' 
      },
      { 
        requestID: 'req006', 
        userID: 'student013', 
        serverID: serverRows[0]?.serverID || null, 
        type: 'Low', 
        description: 'Need additional storage space for research data', 
        status: 'pending' 
      }
    ];
    
    for (const request of requests) {
      await pool.execute(
        'INSERT INTO requests (requestID, userID, serverID, type, description, status) VALUES (?, ?, ?, ?, ?, ?)',
        [request.requestID, request.userID, request.serverID, request.type, request.description, request.status]
      );
    }
    
    console.log('Test requests created successfully');
    return true;
  } catch (error) {
    console.error('Error creating test requests:', error);
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
    console.log('Getting users with params:', { limit, offset, role });
    
    // Simplified query to troubleshoot database connection
    let query = 'SELECT * FROM users';
    const params = [];
    
    if (role) {
      query += ' WHERE role = ?';
      params.push(role);
    }
    
    // For debugging, no pagination for now to simplify
    console.log('Executing simplified query:', query);
    console.log('With params:', params);
    
    const [rows] = await pool.execute(query, params);
    console.log(`Query returned ${rows.length} users`);
    
    // Log first user details for debugging (excluding password)
    if (rows.length > 0) {
      const { password, ...firstUser } = rows[0];
      console.log('First user:', firstUser);
    }
    
    // Check if users are being returned correctly
    // Process the results to include role-specific details
    const processedUsers = [];
    for (const user of rows) {
      // Exclude password from response
      const { password, ...safeUser } = user;
      
      // Get role-specific details
      if (user.role === 'admin') {
        try {
          const [adminRows] = await pool.execute('SELECT designation FROM admins WHERE userID = ?', [user.userID]);
          if (adminRows[0]) {
            safeUser.detail = adminRows[0].designation;
          }
        } catch (error) {
          console.error(`Error getting admin details for ${user.userID}:`, error);
        }
      } else if (user.role === 'student') {
        try {
          const [studentRows] = await pool.execute('SELECT department FROM students WHERE userID = ?', [user.userID]);
          if (studentRows[0]) {
            safeUser.detail = studentRows[0].department;
          }
        } catch (error) {
          console.error(`Error getting student details for ${user.userID}:`, error);
        }
      }
      
      processedUsers.push(safeUser);
    }
    
    // Add pagination back once query works
    if (limit) {
      return processedUsers.slice(offset, offset + limit);
    }
    
    return processedUsers;
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
    
    query += ' ORDER BY r.timestamp DESC';
    
    if (limit) {
      query += ' LIMIT ? OFFSET ?';
      params.push(limit, offset);
    }
    
    console.log('Executing query:', query);
    console.log('With params:', params);
    
    const [rows] = await pool.execute(query, params);
    console.log(`Query returned ${rows.length} requests`);
    
    return rows;
  } catch (error) {
    console.error('Error getting requests:', error);
    return [];
  }
}

// Update request status
async function updateRequestStatus(requestID, status) {
  try {
    const query = 'UPDATE requests SET status = ? WHERE requestID = ?';
    const [result] = await pool.execute(query, [status, requestID]);
    
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error updating request status:', error);
    return false;
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
  updateRequestStatus,
  getWifiSessions,
  createTestUsers,
  createTestRequests
};
