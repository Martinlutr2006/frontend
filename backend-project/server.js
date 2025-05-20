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
  database: "CRPMS",
});

db.connect((err) => {
  if (err) throw err;
  console.log("✅ MySQL connected");
});

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
            res
              .status(201)
              .json({ message: "User registered", id: result.insertId });
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
        if (!match)
          return res.status(401).json({ message: "Invalid password" });

        const token = jwt.sign(
          { id: user.user_id, username: user.username },
          process.env.JWT_SECRET,
          { expiresIn: "2d" }
        );

        res.json({ message: "Login successful", token });
      });
    }
  );
});

// Department routes
app.post("/departments", (req, res) => {
  const { departmentCode, departmentName, grossSalary } = req.body;
  db.query(
    "INSERT INTO Department (departmentCode, departmentName, grossSalary) VALUES (?, ?, ?)",
    [departmentCode, departmentName, grossSalary],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Department added", id: result.insertId });
    }
  );
});

app.get("/departments", (req, res) => {
  db.query("SELECT * FROM Department", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});
// Update department by ID
app.put("/departments/:id", (req, res) => {
  const { id } = req.params;
  const { departmentCode, departmentName, grossSalary } = req.body;
  const sql = "UPDATE department SET departmentCode = ?, departmentName = ?, grossSalary = ? WHERE id = ?";
  db.query(sql, [departmentCode, departmentName, grossSalary, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Department updated" });
  });
});

// Delete department by ID
app.delete("/departments/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM department WHERE id = ?";
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Department deleted" });
  });
});

// Employee routes
app.post("/employees", (req, res) => {
  const {
    employeeNumber,
    firstName,
    lastName,
    position,
    address,
    telephone,
    departmentId,
  } = req.body;

  db.query(
    `INSERT INTO Employee 
      (employeeNumber, firstName, lastName, position, address, telephone, departmentId) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      employeeNumber,
      firstName,
      lastName,
      position,
      address,
      telephone,
      departmentId,
    ],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Employee added", id: result.insertId });
    }
  );
});

app.get("/employees", (req, res) => {
  db.query(
    `SELECT e.*, d.departmentName 
     FROM Employee e 
     JOIN Department d ON e.departmentId = d.id`,
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
});
// Add Employee
app.post("/employees", (req, res) => {
  const {
    employeeNumber,
    firstName,
    lastName,
    position,
    address,
    telephone,
    departmentId,
  } = req.body;
  if (
    !employeeNumber ||
    !firstName ||
    !lastName ||
    !position ||
    !address ||
    !telephone ||
    !departmentId
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }
  // Insert into DB (example using some ORM or SQL query)
  // db.query('INSERT INTO employees ...', [...], (err, result) => { ... });
  res.status(201).json({ message: "Employee added successfully" });
});

// Update Employee
app.put("/employees/:id", (req, res) => {
  const { id } = req.params;
  const {
    employeeNumber,
    firstName,
    lastName,
    position,
    address,
    telephone,
    departmentId,
  } = req.body;

  const query = `
    UPDATE Employee SET 
      employeeNumber = ?,
      firstName = ?,
      lastName = ?,
      position = ?,
      address = ?,
      telephone = ?,
      departmentId = ?
    WHERE id = ?
  `;

  db.query(
    query,
    [
      employeeNumber,
      firstName,
      lastName,
      position,
      address,
      telephone,
      departmentId,
      id,
    ],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to update employee" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Employee not found" });
      }
      res.json({ message: "Employee updated successfully" });
    }
  );
});
// In your server.js or routes file

// DELETE /employees/:id - Delete an employee by id
app.delete('/employees/:id', (req, res) => {
  const employeeId = req.params.id;

  const sql = 'DELETE FROM employee WHERE id = ?';
  db.query(sql, [employeeId], (err, result) => {
    if (err) {
      console.error("Error deleting employee:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }
    res.json({ message: "Employee deleted successfully" });
  });
});

// Salary routes
app.post("/salaries", (req, res) => {
  const { totalDeduction, netSalary, month, employeeId } = req.body;
  db.query(
    `INSERT INTO Salary (totalDeduction, netSalary, month, employeeId)
     VALUES (?, ?, ?, ?)`,
    [totalDeduction, netSalary, month, employeeId],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Salary record added", id: result.insertId });
    }
  );
});

app.get("/salaries", (req, res) => {
  db.query(
    `SELECT s.*, e.firstName, e.lastName, e.position, d.departmentName 
     FROM Salary s 
     JOIN Employee e ON s.employeeId = e.id 
     JOIN Department d ON e.departmentId = d.id`,
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
});

app.put("/salaries/:id", (req, res) => {
  const { id } = req.params;
  const { totalDeduction, netSalary, month } = req.body;
  db.query(
    `UPDATE Salary SET totalDeduction=?, netSalary=?, month=? WHERE id=?`,
    [totalDeduction, netSalary, month, id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Salary updated" });
    }
  );
});

app.delete("/salaries/:id", (req, res) => {
  db.query("DELETE FROM Salary WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Salary deleted" });
  });
});

// Payroll report by month
app.get("/payroll/:month", (req, res) => {
  const { month } = req.params;
  db.query(
    `SELECT e.firstName, e.lastName, e.position, d.departmentName, s.netSalary
     FROM Salary s
     JOIN Employee e ON s.employeeId = e.id
     JOIN Department d ON e.departmentId = d.id
     WHERE s.month = ?`,
    [month],
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
});

// Services routes
app.post("/services", (req, res) => {
  const { service_code, service_name, price } = req.body;
  db.query(
    "INSERT INTO services (service_code, service_name, price) VALUES (?, ?, ?)",
    [service_code, service_name, price],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Service added", service_code: service_code });
    }
  );
});

app.get("/services", (req, res) => {
  db.query("SELECT * FROM services", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

app.put("/services/:code", (req, res) => {
  const { code } = req.params;
  const { service_name, price } = req.body;
  db.query(
    "UPDATE services SET service_name = ?, price = ? WHERE service_code = ?",
    [service_name, price, code],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Service updated" });
    }
  );
});

app.delete("/services/:code", (req, res) => {
  const { code } = req.params;
  db.query("DELETE FROM services WHERE service_code = ?", [code], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Service deleted" });
  });
});

// Cars routes
app.post("/cars", (req, res) => {
  const { platenumber, type, model, manufacturing_year, driver_phone, mechanic_name } = req.body;
  db.query(
    "INSERT INTO cars (platenumber, type, model, manufacturing_year, driver_phone, mechanic_name) VALUES (?, ?, ?, ?, ?, ?)",
    [platenumber, type, model, manufacturing_year, driver_phone, mechanic_name],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Car added", platenumber: platenumber });
    }
  );
});

app.get("/cars", (req, res) => {
  db.query("SELECT * FROM cars", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

app.put("/cars/:platenumber", (req, res) => {
  const { platenumber } = req.params;
  const { type, model, manufacturing_year, driver_phone, mechanic_name } = req.body;
  db.query(
    "UPDATE cars SET type = ?, model = ?, manufacturing_year = ?, driver_phone = ?, mechanic_name = ? WHERE platenumber = ?",
    [type, model, manufacturing_year, driver_phone, mechanic_name, platenumber],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Car updated" });
    }
  );
});

app.delete("/cars/:platenumber", (req, res) => {
  const { platenumber } = req.params;
  db.query("DELETE FROM cars WHERE platenumber = ?", [platenumber], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Car deleted" });
  });
});

// Service Records routes
app.post("/servicerecords", (req, res) => {
  const { servicedate, platenumber, service_code } = req.body;
  db.query(
    "INSERT INTO servicerecords (servicedate, platenumber, service_code) VALUES (?, ?, ?)",
    [servicedate, platenumber, service_code],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Service record added", recordnumber: result.insertId });
    }
  );
});

app.get("/servicerecords", (req, res) => {
  db.query(
    `SELECT sr.*, c.type, c.model, s.service_name, s.price 
     FROM servicerecords sr 
     JOIN cars c ON sr.platenumber = c.platenumber 
     JOIN services s ON sr.service_code = s.service_code`,
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
});

// Payments routes
app.post("/payments", (req, res) => {
  const { amount_paid, payment_date, recordnumber, user_id } = req.body;
  db.query(
    "INSERT INTO payments (amount_paid, payment_date, recordnumber, user_id) VALUES (?, ?, ?, ?)",
    [amount_paid, payment_date, recordnumber, user_id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Payment added", paymentnumber: result.insertId });
    }
  );
});

app.get("/payments", (req, res) => {
  db.query(
    `SELECT p.*, u.username, sr.servicedate, c.platenumber, s.service_name 
     FROM payments p 
     JOIN users u ON p.user_id = u.user_id 
     JOIN servicerecords sr ON p.recordnumber = sr.recordnumber 
     JOIN cars c ON sr.platenumber = c.platenumber 
     JOIN services s ON sr.service_code = s.service_code`,
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
});

// Payment report by date range
app.get("/payments/report", (req, res) => {
  const { start_date, end_date } = req.query;
  db.query(
    `SELECT p.payment_date, u.username, c.platenumber, s.service_name, p.amount_paid
     FROM payments p 
     JOIN users u ON p.user_id = u.user_id 
     JOIN servicerecords sr ON p.recordnumber = sr.recordnumber 
     JOIN cars c ON sr.platenumber = c.platenumber 
     JOIN services s ON sr.service_code = s.service_code
     WHERE p.payment_date BETWEEN ? AND ?
     ORDER BY p.payment_date`,
    [start_date, end_date],
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
});

// Start server
const PORT = process.env.PORT || 3012;
app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));
