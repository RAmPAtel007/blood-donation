// Main Express Server with Authentication & CRUD
// This file contains user authentication and full CRUD operations
require("dotenv").config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// ========================================
// Middleware Setup
// ========================================
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Session Configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'blood-donation-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

// ========================================
// Authentication Middleware
// ========================================
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  res.status(401).json({ 
    success: false, 
    message: 'Please login to access this resource' 
  });
};

// ========================================
// VALIDATION RULES
// ========================================

const userRegisterValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .trim()
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and number'),
  body('full_name')
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Full name must be 2-100 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces'),
  body('phone')
    .trim()
    .matches(/^[0-9]{10}$/).withMessage('Phone must be exactly 10 digits')
];

const donorValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters'),
  body('age')
    .isInt({ min: 18, max: 65 }).withMessage('Age must be between 18 and 65'),
  body('gender')
    .isIn(['Male', 'Female', 'Other']).withMessage('Invalid gender'),
  body('blood_group')
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Invalid blood group'),
  body('city')
    .trim()
    .isLength({ min: 2, max: 30 }).withMessage('City must be 2-30 characters'),
  body('phone')
    .trim()
    .matches(/^[0-9]{10}$/).withMessage('Phone must be exactly 10 digits')
];

const requestValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('blood_group')
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Invalid blood group'),
  body('city')
    .trim()
    .isLength({ min: 2, max: 30 }).withMessage('City must be 2-30 characters'),
  body('reason')
    .trim()
    .isLength({ min: 5, max: 100 }).withMessage('Reason must be 5-100 characters'),
  body('phone')
    .trim()
    .matches(/^[0-9]{10}$/).withMessage('Phone must be exactly 10 digits')
];

// ========================================
// AUTHENTICATION ENDPOINTS
// ========================================

// User Registration (WITH DEBUG LOGGING)
app.post('/api/auth/register', userRegisterValidation, async (req, res) => {
  try {
    console.log('\n========================================');
    console.log('📝 REGISTRATION REQUEST RECEIVED');
    console.log('========================================');
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
    
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation Failed:', JSON.stringify(errors.array(), null, 2));
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }
    console.log('✅ Validation Passed');

    const { username, email, password, full_name, phone } = req.body;

    // Check if user already exists
    console.log('🔍 Checking for existing users...');
    const [existingUsers] = await db.execute(
      'SELECT user_id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUsers.length > 0) {
      console.log('❌ User already exists');
      return res.status(400).json({ 
        success: false, 
        message: 'Username or email already exists' 
      });
    }
    console.log('✅ No existing user found');

    // Hash password
    console.log('🔒 Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('✅ Password hashed successfully');
    console.log('Hashed length:', hashedPassword.length);

    // Insert new user
    console.log('💾 Inserting user into database...');
    const query = `
      INSERT INTO users (username, email, password, full_name, phone) 
      VALUES (?, ?, ?, ?, ?)
    `;
    
    console.log('Query:', query);
    console.log('Parameters:', [username, email, '[HIDDEN]', full_name, phone]);
    
    const [result] = await db.execute(query, 
      [username, email, hashedPassword, full_name, phone]);

    console.log('✅ USER INSERTED SUCCESSFULLY!');
    console.log('New User ID:', result.insertId);
    console.log('Affected Rows:', result.affectedRows);
    console.log('========================================\n');

    res.status(201).json({ 
      success: true, 
      message: 'Registration successful! Please login.',
      user_id: result.insertId 
    });

  } catch (error) {
    console.error('\n========================================');
    console.error('❌ REGISTRATION ERROR');
    console.error('========================================');
    console.error('Error Message:', error.message);
    console.error('Error Code:', error.code);
    console.error('Error SQL:', error.sql);
    console.error('Full Error:', error);
    console.error('========================================\n');
    
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed. Please try again.',
      debug: {
        error: error.message,
        code: error.code
      }
    });
  }
});

// User Login
app.post('/api/auth/login', [
  body('email').trim().isEmail().withMessage('Invalid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    console.log('\n🔐 LOGIN ATTEMPT:', req.body.email);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;

    const [users] = await db.execute(
      'SELECT user_id, username, email, password, full_name FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      console.log('❌ User not found');
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    const user = users[0];

    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      console.log('❌ Invalid password');
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    await db.execute(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = ?',
      [user.user_id]
    );

    req.session.userId = user.user_id;
    req.session.username = user.username;
    req.session.email = user.email;

    console.log('✅ Login successful, User ID:', user.user_id);

    res.json({ 
      success: true, 
      message: 'Login successful!',
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        full_name: user.full_name
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Login failed. Please try again.' 
    });
  }
});

// User Logout
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: 'Logout failed' 
      });
    }
    res.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  });
});

// Check Auth Status
app.get('/api/auth/check', (req, res) => {
  if (req.session && req.session.userId) {
    res.json({ 
      success: true, 
      authenticated: true,
      user: {
        user_id: req.session.userId,
        username: req.session.username,
        email: req.session.email
      }
    });
  } else {
    res.json({ 
      success: true, 
      authenticated: false 
    });
  }
});

// ========================================
// DONOR CRUD OPERATIONS (PROTECTED)
// ========================================

app.post('/api/donors', isAuthenticated, donorValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { name, age, gender, blood_group, city, phone } = req.body;
    const userId = req.session.userId;

    const query = `
      INSERT INTO donors (user_id, name, age, gender, blood_group, city, phone) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(query, 
      [userId, name, age, gender, blood_group, city, phone]);

    res.status(201).json({ 
      success: true, 
      message: 'Donor registered successfully!',
      donor_id: result.insertId 
    });

  } catch (error) {
    console.error('Error registering donor:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again.' 
    });
  }
});

app.get('/api/donors/my', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;

    const query = 'SELECT * FROM donors WHERE user_id = ? ORDER BY created_at DESC';
    const [donors] = await db.execute(query, [userId]);

    res.json({ 
      success: true, 
      count: donors.length,
      donors: donors 
    });

  } catch (error) {
    console.error('Error fetching donors:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again.' 
    });
  }
});

app.get('/api/donors/:id', isAuthenticated, async (req, res) => {
  try {
    const donorId = req.params.id;
    const userId = req.session.userId;

    const query = 'SELECT * FROM donors WHERE donor_id = ? AND user_id = ?';
    const [donors] = await db.execute(query, [donorId, userId]);

    if (donors.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Donor not found' 
      });
    }

    res.json({ 
      success: true, 
      donor: donors[0] 
    });

  } catch (error) {
    console.error('Error fetching donor:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again.' 
    });
  }
});

app.put('/api/donors/:id', isAuthenticated, donorValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const donorId = req.params.id;
    const userId = req.session.userId;
    const { name, age, gender, blood_group, city, phone } = req.body;

    const [existing] = await db.execute(
      'SELECT donor_id FROM donors WHERE donor_id = ? AND user_id = ?',
      [donorId, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Donor not found or unauthorized' 
      });
    }

    const query = `
      UPDATE donors 
      SET name = ?, age = ?, gender = ?, blood_group = ?, city = ?, phone = ?
      WHERE donor_id = ? AND user_id = ?
    `;

    await db.execute(query, 
      [name, age, gender, blood_group, city, phone, donorId, userId]);

    res.json({ 
      success: true, 
      message: 'Donor updated successfully!' 
    });

  } catch (error) {
    console.error('Error updating donor:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again.' 
    });
  }
});

app.delete('/api/donors/:id', isAuthenticated, async (req, res) => {
  try {
    const donorId = req.params.id;
    const userId = req.session.userId;

    const query = 'DELETE FROM donors WHERE donor_id = ? AND user_id = ?';
    const [result] = await db.execute(query, [donorId, userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Donor not found or unauthorized' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Donor deleted successfully!' 
    });

  } catch (error) {
    console.error('Error deleting donor:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again.' 
    });
  }
});

// ========================================
// BLOOD REQUEST CRUD OPERATIONS (PROTECTED)
// ========================================

app.post('/api/requests', isAuthenticated, requestValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { name, blood_group, city, reason, phone } = req.body;
    const userId = req.session.userId;

    const query = `
      INSERT INTO blood_requests (user_id, name, blood_group, city, reason, phone) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(query, 
      [userId, name, blood_group, city, reason, phone]);

    res.status(201).json({ 
      success: true, 
      message: 'Blood request submitted successfully!',
      request_id: result.insertId 
    });

  } catch (error) {
    console.error('Error submitting request:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again.' 
    });
  }
});

app.get('/api/requests/my', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;

    const query = 'SELECT * FROM blood_requests WHERE user_id = ? ORDER BY created_at DESC';
    const [requests] = await db.execute(query, [userId]);

    res.json({ 
      success: true, 
      count: requests.length,
      requests: requests 
    });

  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again.' 
    });
  }
});

app.get('/api/requests/:id', isAuthenticated, async (req, res) => {
  try {
    const requestId = req.params.id;
    const userId = req.session.userId;

    const query = 'SELECT * FROM blood_requests WHERE req_id = ? AND user_id = ?';
    const [requests] = await db.execute(query, [requestId, userId]);

    if (requests.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Request not found' 
      });
    }

    res.json({ 
      success: true, 
      request: requests[0] 
    });

  } catch (error) {
    console.error('Error fetching request:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again.' 
    });
  }
});

app.put('/api/requests/:id', isAuthenticated, requestValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const requestId = req.params.id;
    const userId = req.session.userId;
    const { name, blood_group, city, reason, phone, status } = req.body;

    const [existing] = await db.execute(
      'SELECT req_id FROM blood_requests WHERE req_id = ? AND user_id = ?',
      [requestId, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Request not found or unauthorized' 
      });
    }

    const query = `
      UPDATE blood_requests 
      SET name = ?, blood_group = ?, city = ?, reason = ?, phone = ?, status = ?
      WHERE req_id = ? AND user_id = ?
    `;

    await db.execute(query, 
      [name, blood_group, city, reason, phone, status || 'Pending', requestId, userId]);

    res.json({ 
      success: true, 
      message: 'Request updated successfully!' 
    });

  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again.' 
    });
  }
});

app.delete('/api/requests/:id', isAuthenticated, async (req, res) => {
  try {
    const requestId = req.params.id;
    const userId = req.session.userId;

    const query = 'DELETE FROM blood_requests WHERE req_id = ? AND user_id = ?';
    const [result] = await db.execute(query, [requestId, userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Request not found or unauthorized' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Request deleted successfully!' 
    });

  } catch (error) {
    console.error('Error deleting request:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again.' 
    });
  }
});

// ========================================
// PUBLIC ENDPOINTS
// ========================================

app.get('/search-donors', async (req, res) => {
  try {
    const { blood_group, city } = req.query;

    let query = 'SELECT * FROM donors WHERE 1=1';
    const params = [];

    if (blood_group) {
      query += ' AND blood_group = ?';
      params.push(blood_group);
    }

    if (city) {
      query += ' AND city LIKE ?';
      params.push(`%${city}%`);
    }

    const [donors] = await db.execute(query, params);

    res.json({ 
      success: true, 
      count: donors.length,
      donors: donors 
    });

  } catch (error) {
    console.error('Error searching donors:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again.' 
    });
  }
});

app.get('/get-requests', async (req, res) => {
  try {
    const query = 'SELECT * FROM blood_requests ORDER BY created_at DESC LIMIT 10';
    const [requests] = await db.execute(query);

    res.json({ 
      success: true, 
      count: requests.length,
      requests: requests 
    });

  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again.' 
    });
  }
});

// ========================================
// USER PROFILE ENDPOINTS
// ========================================

app.get('/api/profile', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;

    const [users] = await db.execute(
      'SELECT user_id, username, email, full_name, phone, created_at FROM users WHERE user_id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const [donorCount] = await db.execute(
      'SELECT COUNT(*) as count FROM donors WHERE user_id = ?',
      [userId]
    );

    const [requestCount] = await db.execute(
      'SELECT COUNT(*) as count FROM blood_requests WHERE user_id = ?',
      [userId]
    );

    res.json({ 
      success: true, 
      user: users[0],
      stats: {
        donors: donorCount[0].count,
        requests: requestCount[0].count
      }
    });

  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

app.put('/api/profile', isAuthenticated, [
  body('full_name')
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Full name must be 2-100 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters'),
  body('email')
    .trim()
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail(),
  body('phone')
    .trim()
    .matches(/^[0-9]{10}$/).withMessage('Phone must be exactly 10 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const userId = req.session.userId;
    const { full_name, email, phone } = req.body;

    const [existingUsers] = await db.execute(
      'SELECT user_id FROM users WHERE email = ? AND user_id != ?',
      [email, userId]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already in use by another account' 
      });
    }

    const query = `
      UPDATE users 
      SET full_name = ?, email = ?, phone = ?
      WHERE user_id = ?
    `;

    await db.execute(query, [full_name, email, phone, userId]);

    res.json({ 
      success: true, 
      message: 'Profile updated successfully!' 
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// ========================================
// Start Server
// ========================================
app.listen(PORT, () => {
  console.log('\n========================================');
  console.log('🚀 Server running on http://localhost:' + PORT);
  console.log('🔐 Authentication enabled with session management');
  console.log('📁 Serving static files from public folder');
  console.log('========================================\n');
});