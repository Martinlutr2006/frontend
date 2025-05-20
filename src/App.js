import { useState } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import Navbar from "./components/Navbar";
import EmployeeForm from "./components/EmployeeForm";
import DepartmentForm from "./components/DepartmentForm";
import SalaryManager from "./components/SalaryManager";
import Reports from "./components/Report";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

function App() {
  const [user, setUser] = useState(localStorage.getItem("token") ? true : false);
  const [showRegister, setShowRegister] = useState(true); // Show Register first

  const handleLogin = () => {
    setUser(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(false);
  };

  if (!user) {
    if (showRegister) {
      return <Register onRegister={() => setShowRegister(false)} />;
    }
    return <Login onLogin={handleLogin} onShowRegister={() => setShowRegister(true)} />;
  }

  return (
    <Router>
      <Navbar onLogout={handleLogout} />
      <div className="p-4">
        <Routes>
          <Route path="/employee" element={<EmployeeForm />} />
          <Route path="/department" element={<DepartmentForm />} />
          <Route path="/salary" element={<SalaryManager />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="*" element={<Navigate to="/employee" />} />
        </Routes>
      </div>
    </Router>



  );
}

export default App;
