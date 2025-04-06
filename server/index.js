
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { 
  pool, 
  testConnection, 
  getUserByUsername, 
  getUsers, 
  createTestUsers, 
  getRequests,
  updateRequestStatus,
  createTables 
} = require('./database/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database tables
async function initDatabase() {
  try {
    await testConnection();
    // Create test users after connection is established
    await createTestUsers();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// Auth route for login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    // Check if the user exists
    const user = await getUserByUsername(username);
    
    if (!user) {
      console.log(`Login attempt failed: User "${username}" not found`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Log the stored hashed password for debugging
    console.log(`Stored password for ${username}: ${user.password.substring(0, 20)}...`);
    console.log(`Password attempt: ${password}`);
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      console.log(`Login attempt failed: Invalid password for user "${username}"`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.userID, 
        role: user.role,
        name: user.name  
      },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '24h' }
    );
    
    console.log(`Login successful for user "${username}" with role "${user.role}"`);
    
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        userID: user.userID,
        username: user.userID,
        role: user.role,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify token middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    req.user = decoded;
    console.log('Token verified for user:', decoded.username);
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Admin middleware
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    console.log(`Access denied for user ${req.user.username} with role ${req.user.role}`);
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
  console.log(`Admin access granted for user ${req.user.username}`);
  next();
};

// Protected route - User profile
app.get('/api/user/profile', verifyToken, (req, res) => {
  res.status(200).json({ user: req.user });
});

// PUBLIC API route to get all users - NO AUTH REQUIRED
app.get('/api/users', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;
    const role = req.query.role;
    
    console.log('Fetching users with public access. Params:', { limit, offset, role });
    const users = await getUsers(limit, offset, role);
    
    // Remove sensitive fields from each user for security
    const safeUsers = users.map(user => {
      // Ensure password is never sent to the client
      const { password, ...safeUser } = user;
      return safeUser;
    });
    
    console.log(`Found ${safeUsers.length} users`);
    res.status(200).json(safeUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Protected API route - Add a new user (no authentication required)
app.post('/api/users', async (req, res) => {
  try {
    const { userID, name, email, role, password, phone } = req.body;
    
    console.log('Adding user:', { userID, name, email, role, phone });
    
    // Validate required fields
    if (!userID || !name || !email || !role || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Check if user already exists
    const existingUser = await getUserByUsername(userID);
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists' });
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 8);
    
    // Insert into users table
    const [result] = await pool.execute(
      'INSERT INTO users (userID, name, role, email, phone, password, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [userID, name, role, email, phone || null, hashedPassword]
    );
    
    // Insert role-specific information
    if (role === 'admin') {
      await pool.execute(
        'INSERT INTO admins (userID, designation, researchArea) VALUES (?, ?, ?)',
        [userID, 'New Administrator', null]
      );
    } else if (role === 'student') {
      await pool.execute(
        'INSERT INTO students (userID, department, year) VALUES (?, ?, ?)',
        [userID, 'General', 1]
      );
    }
    
    res.status(201).json({ 
      message: 'User created successfully',
      user: { userID, name, email, role, phone }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Protected route - Delete a user (admin only)
app.delete('/api/users/:userID', verifyToken, isAdmin, async (req, res) => {
  try {
    const { userID } = req.params;
    
    // Prevent deleting yourself
    if (userID === req.user.username) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }
    
    // Check if user exists
    const user = await getUserByUsername(userID);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Delete from users table (will cascade to role-specific tables)
    const [result] = await pool.execute('DELETE FROM users WHERE userID = ?', [userID]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// API route to get servers
app.get('/api/servers', verifyToken, async (req, res) => {
  try {
    const [servers] = await pool.execute('SELECT * FROM servers');
    res.status(200).json(servers);
  } catch (error) {
    console.error('Error fetching servers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// API route to get requests (with auth)
app.get('/api/requests', verifyToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;
    const status = req.query.status;
    
    // If not admin, only show their requests
    const userID = req.user.role === 'admin' ? null : req.user.username;
    
    console.log(`Fetching requests for ${userID || 'admin (all users)'}`);
    
    const requests = await getRequests(userID, limit, offset, status);
    console.log(`Returning ${requests.length} requests`);
    
    res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// API route to update request status (admin only)
app.put('/api/requests/:requestID', verifyToken, isAdmin, async (req, res) => {
  try {
    const { requestID } = req.params;
    const { status } = req.body;
    
    if (!requestID || !status) {
      return res.status(400).json({ message: 'Request ID and status are required' });
    }
    
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    console.log(`Updating request ${requestID} status to ${status}`);
    const success = await updateRequestStatus(requestID, status);
    
    if (!success) {
      return res.status(404).json({ message: 'Request not found or not updated' });
    }
    
    res.status(200).json({ message: `Request ${requestID} status updated to ${status}` });
  } catch (error) {
    console.error('Error updating request status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// API route to get issues
app.get('/api/issues', verifyToken, async (req, res) => {
  try {
    let query = 'SELECT i.*, u.username, s.name as server_name FROM issues i ' +
                'JOIN users u ON i.user_id = u.id ' +
                'LEFT JOIN servers s ON i.server_id = s.id';
    const params = [];
    
    // If user role is not admin, only show their issues
    if (req.user.role !== 'admin') {
      query += ' WHERE i.user_id = ?';
      params.push(req.user.id);
    }
    
    query += ' ORDER BY i.priority DESC, i.created_at DESC';
    
    const [issues] = await pool.execute(query, params);
    res.status(200).json(issues);
  } catch (error) {
    console.error('Error fetching issues:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// API route to get resource allocations
app.get('/api/allocations', verifyToken, async (req, res) => {
  try {
    let query = 'SELECT ra.*, u.username, s.name as server_name FROM resource_allocations ra ' +
                'JOIN users u ON ra.user_id = u.id ' +
                'JOIN servers s ON ra.server_id = s.id';
    const params = [];
    
    // If user role is not admin, only show their allocations
    if (req.user.role !== 'admin') {
      query += ' WHERE ra.user_id = ?';
      params.push(req.user.id);
    }
    
    query += ' ORDER BY ra.allocation_start DESC';
    
    const [allocations] = await pool.execute(query, params);
    res.status(200).json(allocations);
  } catch (error) {
    console.error('Error fetching allocations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Initialize database and start server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
