const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Qpalzm@70',
    database: 'blooddb',
    connectionLimit: 10
});

module.exports = pool.promise();