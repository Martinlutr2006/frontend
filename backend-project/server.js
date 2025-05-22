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
  database: "sims",
});

db.connect((err) => {
  if (err) throw err;
  console.log("✅ MySQL connected to SIMS database");
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

// Spare Parts routes
app.post("/spare-parts", authenticateToken, (req, res) => {
  const { name, category, quantity, unit_price } = req.body;
  const total_price = quantity * unit_price;
  
  db.query(
    "INSERT INTO spare_parts (name, category, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)",
    [name, category, quantity, unit_price, total_price],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.status(201).json({ message: "Spare part added", id: result.insertId });
    }
  );
});

app.get("/spare-parts", authenticateToken, (req, res) => {
  db.query("SELECT * FROM spare_parts", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

app.put("/spare-parts/:part_id", authenticateToken, (req, res) => {
  const { part_id } = req.params;
  const { name, category, quantity, unit_price } = req.body;
  const total_price = quantity * unit_price;
  
  db.query(
    "UPDATE spare_parts SET name = ?, category = ?, quantity = ?, unit_price = ?, total_price = ? WHERE part_id = ?",
    [name, category, quantity, unit_price, total_price, part_id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      if (result.affectedRows === 0) return res.status(404).json({ message: "Spare part not found" });
      res.json({ message: "Spare part updated" });
    }
  );
});

// Stock In routes
app.post("/stock-in", authenticateToken, (req, res) => {
  const { part_id, stock_in_quantity, stock_in_date, unit_price } = req.body;
  const total_price = stock_in_quantity * unit_price;
  
  // Start transaction
  db.beginTransaction(err => {
    if (err) return res.status(500).json(err);
    
    // Insert stock in record
    db.query(
      "INSERT INTO stock_in (part_id, stock_in_quantity, stock_in_date, unit_price, total_price) VALUES (?, ?, ?, ?, ?)",
      [part_id, stock_in_quantity, stock_in_date, unit_price, total_price],
      (err, result) => {
        if (err) {
          return db.rollback(() => res.status(500).json(err));
        }
        
        // Update spare part quantity and total price
        db.query(
          "UPDATE spare_parts SET quantity = quantity + ?, total_price = quantity * unit_price WHERE part_id = ?",
          [stock_in_quantity, part_id],
          (err, result) => {
            if (err) {
              return db.rollback(() => res.status(500).json(err));
            }
            
            db.commit(err => {
              if (err) {
                return db.rollback(() => res.status(500).json(err));
              }
              res.status(201).json({ message: "Stock in record added" });
            });
          }
        );
      }
    );
  });
});

app.get("/stock-in", authenticateToken, (req, res) => {
  db.query(
    `SELECT si.*, sp.name as part_name, sp.category 
     FROM stock_in si 
     JOIN spare_parts sp ON si.part_id = sp.part_id 
     ORDER BY si.stock_in_date DESC`,
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
});

// Stock Out routes
app.post("/stock-out", authenticateToken, (req, res) => {
  const { part_id, stock_out_quantity, stock_out_unit_price, stock_out_date } = req.body;
  const stock_out_total_price = stock_out_quantity * stock_out_unit_price;
  
  // Start transaction
  db.beginTransaction(err => {
    if (err) return res.status(500).json(err);
    
    // Check if enough quantity is available
    db.query(
      "SELECT quantity FROM spare_parts WHERE part_id = ?",
      [part_id],
      (err, results) => {
        if (err) {
          return db.rollback(() => res.status(500).json(err));
        }
        
        if (results[0].quantity < stock_out_quantity) {
          return db.rollback(() => res.status(400).json({ message: "Insufficient stock" }));
        }
        
        // Insert stock out record
        db.query(
          "INSERT INTO stock_out (part_id, stock_out_quantity, stock_out_unit_price, stock_out_total_price, stock_out_date) VALUES (?, ?, ?, ?, ?)",
          [part_id, stock_out_quantity, stock_out_unit_price, stock_out_total_price, stock_out_date],
          (err, result) => {
            if (err) {
              return db.rollback(() => res.status(500).json(err));
            }
            
            // Update spare part quantity and total price
            db.query(
              "UPDATE spare_parts SET quantity = quantity - ?, total_price = quantity * unit_price WHERE part_id = ?",
              [stock_out_quantity, part_id],
              (err, result) => {
                if (err) {
                  return db.rollback(() => res.status(500).json(err));
                }
                
                db.commit(err => {
                  if (err) {
                    return db.rollback(() => res.status(500).json(err));
                  }
                  res.status(201).json({ message: "Stock out record added" });
                });
              }
            );
          }
        );
      }
    );
  });
});

app.get("/stock-out", authenticateToken, (req, res) => {
  db.query(
    `SELECT so.*, sp.name as part_name, sp.category 
     FROM stock_out so 
     JOIN spare_parts sp ON so.part_id = sp.part_id 
     ORDER BY so.stock_out_date DESC`,
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
});

app.put("/stock-out/:stock_out_id", authenticateToken, (req, res) => {
  const { stock_out_id } = req.params;
  const { stock_out_quantity, stock_out_unit_price, stock_out_date } = req.body;
  const stock_out_total_price = stock_out_quantity * stock_out_unit_price;
  
  // Start transaction
  db.beginTransaction(err => {
    if (err) return res.status(500).json(err);
    
    // Get the original stock out record
    db.query(
      "SELECT part_id, stock_out_quantity FROM stock_out WHERE stock_out_id = ?",
      [stock_out_id],
      (err, results) => {
        if (err) {
          return db.rollback(() => res.status(500).json(err));
        }
        
        if (results.length === 0) {
          return db.rollback(() => res.status(404).json({ message: "Stock out record not found" }));
        }
        
        const originalRecord = results[0];
        const quantityDifference = stock_out_quantity - originalRecord.stock_out_quantity;
        
        // Update stock out record
        db.query(
          "UPDATE stock_out SET stock_out_quantity = ?, stock_out_unit_price = ?, stock_out_total_price = ?, stock_out_date = ? WHERE stock_out_id = ?",
          [stock_out_quantity, stock_out_unit_price, stock_out_total_price, stock_out_date, stock_out_id],
          (err, result) => {
            if (err) {
              return db.rollback(() => res.status(500).json(err));
            }
            
            // Update spare part quantity
            db.query(
              "UPDATE spare_parts SET quantity = quantity - ?, total_price = quantity * unit_price WHERE part_id = ?",
              [quantityDifference, originalRecord.part_id],
              (err, result) => {
                if (err) {
                  return db.rollback(() => res.status(500).json(err));
                }
                
                db.commit(err => {
                  if (err) {
                    return db.rollback(() => res.status(500).json(err));
                  }
                  res.json({ message: "Stock out record updated" });
                });
              }
            );
          }
        );
      }
    );
  });
});

app.delete("/stock-out/:stock_out_id", authenticateToken, (req, res) => {
  const { stock_out_id } = req.params;
  
  // Start transaction
  db.beginTransaction(err => {
    if (err) return res.status(500).json(err);
    
    // Get the stock out record
    db.query(
      "SELECT part_id, stock_out_quantity FROM stock_out WHERE stock_out_id = ?",
      [stock_out_id],
      (err, results) => {
        if (err) {
          return db.rollback(() => res.status(500).json(err));
        }
        
        if (results.length === 0) {
          return db.rollback(() => res.status(404).json({ message: "Stock out record not found" }));
        }
        
        const record = results[0];
        
        // Delete stock out record
        db.query(
          "DELETE FROM stock_out WHERE stock_out_id = ?",
          [stock_out_id],
          (err, result) => {
            if (err) {
              return db.rollback(() => res.status(500).json(err));
            }
            
            // Update spare part quantity
            db.query(
              "UPDATE spare_parts SET quantity = quantity + ?, total_price = quantity * unit_price WHERE part_id = ?",
              [record.stock_out_quantity, record.part_id],
              (err, result) => {
                if (err) {
                  return db.rollback(() => res.status(500).json(err));
                }
                
                db.commit(err => {
                  if (err) {
                    return db.rollback(() => res.status(500).json(err));
                  }
                  res.json({ message: "Stock out record deleted" });
                });
              }
            );
          }
        );
      }
    );
  });
});

// Reports routes
app.get("/reports/daily-stock-status", authenticateToken, (req, res) => {
  const { date } = req.query;
  
  db.query(
    `SELECT 
      sp.name,
      sp.quantity as stored_quantity,
      COALESCE(SUM(so.stock_out_quantity), 0) as stock_out_quantity,
      sp.quantity - COALESCE(SUM(so.stock_out_quantity), 0) as remaining_quantity
     FROM spare_parts sp
     LEFT JOIN stock_out so ON sp.part_id = so.part_id 
     AND DATE(so.stock_out_date) = ?
     GROUP BY sp.part_id, sp.name, sp.quantity
     ORDER BY sp.name`,
    [date],
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
});

app.get("/reports/daily-stock-out", authenticateToken, (req, res) => {
  const { date } = req.query;
  
  db.query(
    `SELECT 
      so.*,
      sp.name as part_name,
      sp.category
     FROM stock_out so
     JOIN spare_parts sp ON so.part_id = sp.part_id
     WHERE DATE(so.stock_out_date) = ?
     ORDER BY so.stock_out_date DESC`,
    [date],
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
