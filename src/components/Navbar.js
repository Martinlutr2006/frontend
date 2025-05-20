import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-blue-700 text-white p-4 flex justify-between">
      <div className="flex space-x-4">
        <Link to="/employee" className="hover:underline">Employees</Link>
        <Link to="/department" className="hover:underline">Departments</Link>
        <Link to="/salary" className="hover:underline">Salaries</Link>
        <Link to="/reports" className="hover:underline">Reports</Link>
      </div>
      <button onClick={() => {
        localStorage.removeItem("token");
        window.location.reload();
      }} className="bg-red-500 px-3 py-1 rounded">Logout</button>
    </nav>
  );
};

export default Navbar;
