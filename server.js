// Main Express Server
// This file contains all REST API endpoints

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db'); // Import database connection

const app = express();
const PORT = 3000;

// Middleware Setup
app.use(cors());                          // Enable CORS for frontend requests
app.use(bodyParser.json());               // Parse JSON request bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded data
app.use(express.static('public'));        // Serve static files from public folder

// ========================================
// API ENDPOINT 1: Register New Donor
// POST /register-donor
// Purpose: Add new donor to database
// ========================================
app.post('/register-donor', async (req, res) => {
  try {
    // Extract donor details from request body
    const { name, age, gender, blood_group, city, phone } = req.body;

    // Validation: Check if all fields are provided
    if (!name || !age || !gender || !blood_group || !city || !phone) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // SQL query to insert donor into database
    const query = `
      INSERT INTO donors (name, age, gender, blood_group, city, phone) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    // Execute query with parameterized values (prevents SQL injection)
    const [result] = await db.execute(query, [name, age, gender, blood_group, city, phone]);

    // Send success response
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

// ========================================
// API ENDPOINT 2: Search Donors
// GET /search-donors
// Purpose: Find donors by blood group and city
// ========================================
app.get('/search-donors', async (req, res) => {
  try {
    // Get search parameters from query string
    const { blood_group, city } = req.query;

    // Build dynamic SQL query based on provided filters
    let query = 'SELECT * FROM donors WHERE 1=1';
    const params = [];

    // Add blood group filter if provided
    if (blood_group) {
      query += ' AND blood_group = ?';
      params.push(blood_group);
    }

    // Add city filter if provided
    if (city) {
      query += ' AND city LIKE ?';
      params.push(`%${city}%`); // Use LIKE for partial matching
    }

    // Execute search query
    const [donors] = await db.execute(query, params);

    // Send results
    res.status(200).json({ 
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

// ========================================
// API ENDPOINT 3: Request Blood
// POST /request-blood
// Purpose: Submit new blood request
// ========================================
app.post('/request-blood', async (req, res) => {
  try {
    // Extract request details from body
    const { name, blood_group, city, reason, phone } = req.body;

    // Validation
    if (!name || !blood_group || !city || !reason || !phone) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // SQL query to insert blood request
    const query = `
      INSERT INTO blood_requests (name, blood_group, city, reason, phone) 
      VALUES (?, ?, ?, ?, ?)
    `;

    // Execute insertion
    const [result] = await db.execute(query, [name, blood_group, city, reason, phone]);

    // Send success response
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

// ========================================
// API ENDPOINT 4: Get All Blood Requests
// GET /get-requests
// Purpose: Retrieve all blood requests
// ========================================
app.get('/get-requests', async (req, res) => {
  try {
    // Query to get all requests, ordered by most recent first
    const query = 'SELECT * FROM blood_requests ORDER BY req_id DESC';

    // Execute query
    const [requests] = await db.execute(query);

    // Send results
    res.status(200).json({ 
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
// Start Server
// ========================================
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
//   console.log(`📁 Serving static files from 'public' folder`);
// });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
