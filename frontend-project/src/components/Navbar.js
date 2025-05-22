import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar({ user, onLogout }) {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'bg-blue-700' : 'hover:bg-blue-600';
  };

  return (
    <nav className="bg-blue-800 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold">
              SmartPark SIMS
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/spare-parts"
              className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/spare-parts')}`}
            >
              Spare Parts
            </Link>
            <Link
              to="/stock-in"
              className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/stock-in')}`}
            >
              Stock In
            </Link>
            <Link
              to="/stock-out"
              className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/stock-out')}`}
            >
              Stock Out
            </Link>
            <Link
              to="/reports"
              className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/reports')}`}
            >
              Reports
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm">
              {user?.username} ({user?.role})
            </span>
            <button
              onClick={onLogout}
              className="px-3 py-2 rounded-md text-sm font-medium bg-red-600 hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
