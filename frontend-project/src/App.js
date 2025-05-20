import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useState } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import ServiceManager from "./components/ServiceManager";
import CarManager from "./components/CarManager";
import ServiceRecordManager from "./components/ServiceRecordManager";
import PaymentManager from "./components/PaymentManager";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setUser(userData);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem("token");
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-lg">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex justify-between">
              <div className="flex space-x-7">
                <div className="flex items-center py-4">
                  <span className="font-semibold text-gray-500 text-lg">
                    Auto Service Management
                  </span>
                </div>
                {isLoggedIn && (
                  <div className="flex items-center space-x-4">
                    <Link
                      to="/services"
                      className="py-4 px-2 text-gray-500 hover:text-blue-500"
                    >
                      Services
                    </Link>
                    <Link
                      to="/cars"
                      className="py-4 px-2 text-gray-500 hover:text-blue-500"
                    >
                      Cars
                    </Link>
                    <Link
                      to="/records"
                      className="py-4 px-2 text-gray-500 hover:text-blue-500"
                    >
                      Service Records
                    </Link>
                    <Link
                      to="/payments"
                      className="py-4 px-2 text-gray-500 hover:text-blue-500"
                    >
                      Payments
                    </Link>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-3">
                {!isLoggedIn ? (
                  <>
                    <Link
                      to="/login"
                      className="py-2 px-4 text-gray-500 hover:text-blue-500"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Register
                    </Link>
                  </>
                ) : (
                  <button
                    onClick={handleLogout}
                    className="py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Logout
                  </button>
                )}
              </div>
            </div>
          </div>
        </nav>

        <div className="container mx-auto py-6">
          <Routes>
            <Route
              path="/login"
              element={<Login onLogin={handleLogin} />}
            />
            <Route path="/register" element={<Register />} />
            <Route
              path="/services"
              element={
                isLoggedIn ? (
                  <ServiceManager />
                ) : (
                  <div className="text-center">Please login to access this page</div>
                )
              }
            />
            <Route
              path="/cars"
              element={
                isLoggedIn ? (
                  <CarManager />
                ) : (
                  <div className="text-center">Please login to access this page</div>
                )
              }
            />
            <Route
              path="/records"
              element={
                isLoggedIn ? (
                  <ServiceRecordManager />
                ) : (
                  <div className="text-center">Please login to access this page</div>
                )
              }
            />
            <Route
              path="/payments"
              element={
                isLoggedIn ? (
                  <PaymentManager />
                ) : (
                  <div className="text-center">Please login to access this page</div>
                )
              }
            />
            <Route
              path="/"
              element={
                <div className="text-center">
                  <h1 className="text-2xl font-bold mb-4">Welcome to Auto Service Management</h1>
                  {!isLoggedIn && (
                    <p className="text-gray-600">
                      Please login or register to access the system
                    </p>
                  )}
                </div>
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
