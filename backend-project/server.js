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
  database: "PSSMS",
});

db.connect((err) => {
  if (err) throw err;
  console.log("✅ MySQL connected to PSSMS database");
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: "Access denied" });
  
  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
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
          { id: user.user_id, username: user.username, role: user.role },
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

// Parking Slots routes
app.get("/parking-slots", authenticateToken, (req, res) => {
  db.query("SELECT * FROM parking_slots", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

app.put("/parking-slots/:slot_number", authenticateToken, (req, res) => {
  const { slot_number } = req.params;
  const { slot_status } = req.body;
  
  db.query(
    "UPDATE parking_slots SET slot_status = ? WHERE slot_number = ?",
    [slot_status, slot_number],
    (err, result) => {
      if (err) return res.status(500).json(err);
      if (result.affectedRows === 0) return res.status(404).json({ message: "Slot not found" });
      res.json({ message: "Slot status updated" });
    }
  );
});

// Cars routes
app.post("/cars", authenticateToken, (req, res) => {
  const { plate_number, driver_name, phone_number } = req.body;
  
  db.query(
    "INSERT INTO cars (plate_number, driver_name, phone_number) VALUES (?, ?, ?)",
    [plate_number, driver_name, phone_number],
    (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ message: "Car already registered" });
        }
        return res.status(500).json(err);
      }
      res.status(201).json({ message: "Car registered successfully" });
    }
  );
});

app.get("/cars", authenticateToken, (req, res) => {
  db.query("SELECT * FROM cars", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// Parking Records routes
app.post("/parking-records", authenticateToken, (req, res) => {
  const { plate_number, slot_number } = req.body;
  const entry_time = new Date();
  
  // Start transaction
  db.beginTransaction(err => {
    if (err) return res.status(500).json(err);
    
    // Check if slot is available
    db.query(
      "SELECT slot_status FROM parking_slots WHERE slot_number = ?",
      [slot_number],
      (err, results) => {
        if (err) {
          return db.rollback(() => res.status(500).json(err));
        }
        
        if (results[0].slot_status !== 'available') {
          return db.rollback(() => res.status(400).json({ message: "Slot is not available" }));
        }
        
        // Create parking record
        db.query(
          "INSERT INTO parking_records (plate_number, slot_number, entry_time) VALUES (?, ?, ?)",
          [plate_number, slot_number, entry_time],
          (err, result) => {
            if (err) {
              return db.rollback(() => res.status(500).json(err));
            }
            
            // Update slot status
            db.query(
              "UPDATE parking_slots SET slot_status = 'occupied' WHERE slot_number = ?",
              [slot_number],
              (err, result) => {
                if (err) {
                  return db.rollback(() => res.status(500).json(err));
                }
                
                db.commit(err => {
                  if (err) {
                    return db.rollback(() => res.status(500).json(err));
                  }
                  res.status(201).json({ 
                    message: "Parking record created",
                    record_id: result.insertId,
                    entry_time
                  });
                });
              }
            );
          }
        );
      }
    );
  });
});

// Calculate parking fee (500 RWF per hour, minimum 1 hour)
const calculateParkingFee = (duration) => {
  const hours = Math.ceil(duration / 60); // Convert minutes to hours, round up
  return Math.max(1, hours) * 500; // Minimum 1 hour charge
};

app.put("/parking-records/:record_id/exit", authenticateToken, (req, res) => {
  const { record_id } = req.params;
  const exit_time = new Date();
  
  // Start transaction
  db.beginTransaction(err => {
    if (err) return res.status(500).json(err);
    
    // Get parking record
    db.query(
      "SELECT * FROM parking_records WHERE record_id = ? AND exit_time IS NULL",
      [record_id],
      (err, results) => {
        if (err) {
          return db.rollback(() => res.status(500).json(err));
        }
        
        if (results.length === 0) {
          return db.rollback(() => res.status(404).json({ message: "Record not found or already exited" }));
        }
        
        const record = results[0];
        const duration = Math.round((exit_time - new Date(record.entry_time)) / (1000 * 60)); // Duration in minutes
        const amount = calculateParkingFee(duration);
        
        // Update parking record
        db.query(
          "UPDATE parking_records SET exit_time = ?, duration = ? WHERE record_id = ?",
          [exit_time, duration, record_id],
          (err, result) => {
            if (err) {
              return db.rollback(() => res.status(500).json(err));
            }
            
            // Update slot status
            db.query(
              "UPDATE parking_slots SET slot_status = 'available' WHERE slot_number = ?",
              [record.slot_number],
              (err, result) => {
                if (err) {
                  return db.rollback(() => res.status(500).json(err));
                }
                
                db.commit(err => {
                  if (err) {
                    return db.rollback(() => res.status(500).json(err));
                  }
                  res.json({ 
                    message: "Exit recorded",
                    duration,
                    amount
                  });
                });
              }
            );
          }
        );
      }
    );
  });
});

// Payments routes
app.post("/payments", authenticateToken, (req, res) => {
  const { record_id, amount_paid } = req.body;
  const payment_date = new Date();
  
  db.query(
    "INSERT INTO payments (record_id, amount_paid, payment_date) VALUES (?, ?, ?)",
    [record_id, amount_paid, payment_date],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.status(201).json({ message: "Payment recorded" });
    }
  );
});

// Reports routes
app.get("/reports/daily", authenticateToken, (req, res) => {
  const { date } = req.query;
  const start_date = new Date(date);
  start_date.setHours(0, 0, 0, 0);
  const end_date = new Date(date);
  end_date.setHours(23, 59, 59, 999);
  
  db.query(
    `SELECT pr.plate_number, c.driver_name, pr.entry_time, pr.exit_time, 
            pr.duration, p.amount_paid, p.payment_date
     FROM parking_records pr
     JOIN cars c ON pr.plate_number = c.plate_number
     LEFT JOIN payments p ON pr.record_id = p.record_id
     WHERE pr.entry_time BETWEEN ? AND ?
     ORDER BY pr.entry_time DESC`,
    [start_date, end_date],
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
});

// Get available slots count
app.get("/parking-slots/available", authenticateToken, (req, res) => {
  db.query(
    "SELECT COUNT(*) as available_count FROM parking_slots WHERE slot_status = 'available'",
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results[0]);
    }
  );
});

// Dashboard Statistics
app.get('/api/dashboard/stats', authenticateToken, (req, res) => {
    // Get total and available parking slots
    db.query(
        'SELECT COUNT(*) as total, SUM(CASE WHEN slot_status = "available" THEN 1 ELSE 0 END) as available FROM parking_slots',
        (err, slotsResult) => {
            if (err) return res.status(500).json(err);

            // Get total registered cars
            db.query('SELECT COUNT(*) as total FROM cars', (err, carsResult) => {
                if (err) return res.status(500).json(err);

                // Get active parking records
                db.query(
                    'SELECT COUNT(*) as active FROM parking_records WHERE exit_time IS NULL',
                    (err, activeResult) => {
                        if (err) return res.status(500).json(err);

                        // Get total revenue (in RWF)
                        db.query(
                            'SELECT COALESCE(SUM(amount_paid), 0) as total FROM payments',
                            (err, revenueResult) => {
                                if (err) return res.status(500).json(err);

                                // Get average parking duration in minutes
                                db.query(
                                    `SELECT AVG(TIMESTAMPDIFF(MINUTE, entry_time, COALESCE(exit_time, NOW()))) as avg_duration 
                                    FROM parking_records 
                                    WHERE exit_time IS NOT NULL`,
                                    (err, durationResult) => {
                                        if (err) return res.status(500).json(err);

                                        const stats = {
                                            totalSlots: slotsResult[0].total || 0,
                                            availableSlots: slotsResult[0].available || 0,
                                            totalCars: carsResult[0].total || 0,
                                            activeParking: activeResult[0].active || 0,
                                            totalRevenue: revenueResult[0].total || 0,
                                            averageDuration: Math.round(durationResult[0].avg_duration || 0)
                                        };

                                        res.json(stats);
                                    }
                                );
                            }
                        );
                    }
                );
            });
        }
    );
});

// Get active parking records
app.get("/api/parking-records/active", authenticateToken, (req, res) => {
    db.query(
        `SELECT pr.*, c.driver_name, c.phone_number, ps.slot_status
         FROM parking_records pr
         JOIN cars c ON pr.plate_number = c.plate_number
         JOIN parking_slots ps ON pr.slot_number = ps.slot_number
         WHERE pr.exit_time IS NULL
         ORDER BY pr.entry_time DESC`,
        (err, results) => {
            if (err) return res.status(500).json(err);
            res.json(results);
        }
    );
});

// Get reports with date range
app.get("/api/reports", authenticateToken, (req, res) => {
    const { startDate, endDate } = req.query;
    const start_date = new Date(startDate);
    start_date.setHours(0, 0, 0, 0);
    const end_date = new Date(endDate);
    end_date.setHours(23, 59, 59, 999);
    
    db.query(
        `SELECT 
            pr.record_id,
            pr.plate_number,
            c.driver_name,
            c.phone_number,
            pr.slot_number,
            pr.entry_time,
            pr.exit_time,
            pr.duration,
            p.amount_paid,
            p.payment_date
         FROM parking_records pr
         JOIN cars c ON pr.plate_number = c.plate_number
         LEFT JOIN payments p ON pr.record_id = p.record_id
         WHERE pr.entry_time BETWEEN ? AND ?
         ORDER BY pr.entry_time DESC`,
        [start_date, end_date],
        (err, results) => {
            if (err) return res.status(500).json(err);
            res.json(results);
        }
    );
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
