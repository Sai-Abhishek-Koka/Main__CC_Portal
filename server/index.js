
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { pool, testConnection } = require('./database/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database tables
async function initDatabase() {
  try {
    await testConnection();
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
    const [rows] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
    
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '24h' }
    );
    
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
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
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Protected route example
app.get('/api/user/profile', verifyToken, (req, res) => {
  res.status(200).json({ user: req.user });
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

// API route to get user requests
app.get('/api/requests', verifyToken, async (req, res) => {
  try {
    let query = 'SELECT * FROM requests';
    const params = [];
    
    // If user role is not admin, only show their requests
    if (req.user.role !== 'admin') {
      query += ' WHERE user_id = ?';
      params.push(req.user.id);
    }
    
    const [requests] = await pool.execute(query, params);
    res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// API route to get issues
app.get('/api/issues', verifyToken, async (req, res) => {
  try {
    let query = 'SELECT * FROM issues';
    const params = [];
    
    // If user role is not admin, only show their issues
    if (req.user.role !== 'admin') {
      query += ' WHERE user_id = ?';
      params.push(req.user.id);
    }
    
    const [issues] = await pool.execute(query, params);
    res.status(200).json(issues);
  } catch (error) {
    console.error('Error fetching issues:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Initialize database and start server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
