require("dotenv").config();
console.log("JWT_SECRET:", process.env.JWT_SECRET);

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "cwsms",
});

db.connect((err) => {
  if (err) throw err;
  console.log("✅ MySQL connected to CWSMS database");
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: "Access denied" });
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
};

// Register
app.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: "Username and password required" });

  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    (err, result) => {
      if (err) return res.status(500).json(err);
      if (result.length > 0)
        return res.status(409).json({ message: "User already exists" });

      bcrypt.hash(password, 10, (err, hash) => {
        if (err) return res.status(500).json(err);
        db.query(
          "INSERT INTO users (username, password) VALUES (?, ?)",
          [username, hash],
          (err, result) => {
            if (err) return res.status(500).json(err);
            res.status(201).json({ message: "User registered", id: result.insertId });
          }
        );
      });
    }
  );
});

// Login
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    (err, result) => {
      if (err) return res.status(500).json(err);
      if (result.length === 0)
        return res.status(404).json({ message: "User not found" });

      const user = result[0];
      bcrypt.compare(password, user.password, (err, match) => {
        if (err) return res.status(500).json(err);
        if (!match) return res.status(401).json({ message: "Invalid password" });

        const token = jwt.sign(
          { id: user.user_id, username: user.username },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: "2d" }
        );

        const { password: _, ...userData } = user;
        res.json({
          message: "Login successful",
          token,
          user: userData
        });
      });
    }
  );
});

// Car routes
app.post("/cars", authenticateToken, (req, res) => {
  const { plate_number, car_type, car_size, driver_name, driver_phone } = req.body;
  
  db.query(
    "INSERT INTO cars (plate_number, car_type, car_size, driver_name, driver_phone) VALUES (?, ?, ?, ?, ?)",
    [plate_number, car_type, car_size, driver_name, driver_phone],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.status(201).json({ message: "Car added", id: result.insertId });
    }
  );
});

app.get("/cars", authenticateToken, (req, res) => {
  db.query("SELECT * FROM cars", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

app.put("/cars/:plate_number", authenticateToken, (req, res) => {
  const { plate_number } = req.params;
  const { car_type, car_size, driver_name, driver_phone } = req.body;
  
  db.query(
    "UPDATE cars SET car_type = ?, car_size = ?, driver_name = ?, driver_phone = ? WHERE plate_number = ?",
    [car_type, car_size, driver_name, driver_phone, plate_number],
    (err, result) => {
      if (err) return res.status(500).json(err);
      if (result.affectedRows === 0) return res.status(404).json({ message: "Car not found" });
      res.json({ message: "Car updated" });
    }
  );
});

app.delete("/cars/:plate_number", authenticateToken, (req, res) => {
  const { plate_number } = req.params;
  
  // Delete car directly - related records will be deleted automatically due to CASCADE
  db.query("DELETE FROM cars WHERE plate_number = ?", [plate_number], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Car not found" });
    res.json({ message: "Car and associated records deleted successfully" });
  });
});

// Package routes
app.get("/packages", authenticateToken, (req, res) => {
  db.query("SELECT * FROM packages", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// Service Package routes
app.post("/service-packages", authenticateToken, (req, res) => {
  const { service_date, package_number, plate_number } = req.body;
  
  db.query(
    "INSERT INTO service_packages (service_date, package_number, plate_number) VALUES (?, ?, ?)",
    [service_date, package_number, plate_number],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.status(201).json({ message: "Service package added", id: result.insertId });
    }
  );
});

app.get("/service-packages", authenticateToken, (req, res) => {
  db.query(
    `SELECT sp.*, p.package_name, p.package_price, c.driver_name, c.driver_phone 
     FROM service_packages sp 
     JOIN packages p ON sp.package_number = p.package_number 
     JOIN cars c ON sp.plate_number = c.plate_number`,
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
});

// Payment routes
app.post("/payments", authenticateToken, (req, res) => {
  const { amount_paid, payment_date, record_number } = req.body;
  
  db.query(
    "INSERT INTO payments (amount_paid, payment_date, record_number) VALUES (?, ?, ?)",
    [amount_paid, payment_date, record_number],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.status(201).json({ message: "Payment added", id: result.insertId });
    }
  );
});

app.get("/payments", authenticateToken, (req, res) => {
  db.query(
    `SELECT p.*, sp.service_date, pk.package_name, c.plate_number, c.driver_name 
     FROM payments p 
     JOIN service_packages sp ON p.record_number = sp.record_number 
     JOIN packages pk ON sp.package_number = pk.package_number 
     JOIN cars c ON sp.plate_number = c.plate_number`,
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
});

// Reports routes
app.get("/reports/daily", authenticateToken, (req, res) => {
  const { date } = req.query;
  
  db.query(
    `SELECT 
      COUNT(*) as total_services,
      SUM(p.amount_paid) as total_revenue,
      COUNT(CASE WHEN p.payment_number IS NULL THEN 1 END) as unpaid_services
     FROM service_packages sp 
     LEFT JOIN payments p ON sp.record_number = p.record_number 
     WHERE DATE(sp.service_date) = ?`,
    [date],
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results[0]);
    }
  );
});

app.get("/reports/weekly", authenticateToken, (req, res) => {
  const { start_date, end_date } = req.query;
  
  db.query(
    `SELECT 
      DATE(sp.service_date) as date,
      COUNT(*) as total_services,
      SUM(p.amount_paid) as total_revenue,
      COUNT(CASE WHEN p.payment_number IS NULL THEN 1 END) as unpaid_services
     FROM service_packages sp 
     LEFT JOIN payments p ON sp.record_number = p.record_number 
     WHERE DATE(sp.service_date) BETWEEN ? AND ?
     GROUP BY DATE(sp.service_date)
     ORDER BY date`,
    [start_date, end_date],
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
});

// Start server
const PORT = process.env.PORT || 3012;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
