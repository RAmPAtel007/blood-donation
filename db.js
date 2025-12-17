// // Database Connection Configuration
// // This file establishes connection with MySQL database

// const mysql = require('mysql2');

// // Create connection pool for better performance
// // Pool manages multiple connections automatically
// // const pool = mysql.createPool({
// //   host: 'localhost',        // Database host
// //   user: 'root',            // MySQL username
// //   password: '',            // MySQL password (change if you have one)
// //   database: 'blooddb',     // Database name
// //   waitForConnections: true,
// //   connectionLimit: 10,     // Maximum number of connections
// //   queueLimit: 0
// // });

// const pool = mysql.createPool({
//   host: 'localhost',
//   user: 'root',           // Change if different
//   password: 'Qpalzm@70',           // Add your MySQL password
//   database: 'blooddb'
// });

// // Convert pool to use promises for async/await
// const promisePool = pool.promise();

// // Test database connection
// pool.getConnection((err, connection) => {
//   if (err) {
//     console.error('❌ Database connection failed:', err.message);
//   } else {
//     console.log('✅ Database connected successfully');
//     connection.release(); // Release connection back to pool
//   }
// });

// // Export promise pool for use in server.js
// module.exports = promisePool;

// Database Connection Configuration
// Railway / Production ready MySQL connection

const mysql = require("mysql2");

// Create connection pool using ENV variables
const pool = mysql.createPool({
  host: process.env.MYSQLHOST,        // Railway MySQL host
  user: process.env.MYSQLUSER,        // Railway MySQL user
  password: process.env.MYSQLPASSWORD, // Railway MySQL password
  database: process.env.MYSQLDATABASE, // Railway MySQL database
  port: process.env.MYSQLPORT,        // Railway MySQL port
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Convert pool to promise-based
const promisePool = pool.promise();

// Test database connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
  } else {
    console.log("✅ Railway MySQL connected successfully");
    connection.release();
  }
});

// Export pool
module.exports = promisePool;
