const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Create connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  multipleStatements: true // Allow multiple SQL statements
});

// Read the SQL file
const sqlFile = path.join(__dirname, 'database.sql');
const sql = fs.readFileSync(sqlFile, 'utf8');

// Connect and execute the SQL
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL server');

  // Drop and recreate the database
  connection.query('DROP DATABASE IF EXISTS cwsms; CREATE DATABASE cwsms;', (err) => {
    if (err) {
      console.error('Error dropping/creating database:', err);
      connection.end();
      return;
    }
    console.log('Database reset successfully');

    // Use the database
    connection.query('USE cwsms;', (err) => {
      if (err) {
        console.error('Error selecting database:', err);
        connection.end();
        return;
      }

      // Execute the SQL file
      connection.query(sql, (err) => {
        if (err) {
          console.error('Error executing SQL file:', err);
          connection.end();
          return;
        }
        console.log('Database schema and initial data created successfully');
        connection.end();
      });
    });
  });
}); 