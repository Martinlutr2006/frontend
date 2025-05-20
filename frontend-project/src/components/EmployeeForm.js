import { useState, useEffect } from "react";
import api from "../api";

const EmployeeForm = () => {
  // Form state
  const [employeeNumber, setEmployeeNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [position, setPosition] = useState("");
  const [address, setAddress] = useState("");
  const [telephone, setTelephone] = useState("");
  const [departmentId, setDepartmentId] = useState("");

  // Other state
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // Fetch departments on mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await api.get("/departments");
        setDepartments(res.data);
      } catch {
        alert("Error fetching departments");
      }
    };
    fetchDepartments();
  }, []);

  // Fetch employees on mount and after changes
  const fetchEmployees = async () => {
    try {
      const res = await api.get("/employees");
      setEmployees(res.data);
    } catch {
      alert("Error fetching employees");
    }
  };
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Reset form fields
  const resetForm = () => {
    setEmployeeNumber("");
    setFirstName("");
    setLastName("");
    setPosition("");
    setAddress("");
    setTelephone("");
    setDepartmentId("");
    setEditingId(null);
  };

  // Handle add or update
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Update employee
        await api.put(`/employees/${editingId}`, {
          employeeNumber,
          firstName,
          lastName,
          position,
          address,
          telephone,
          departmentId,
        });
        alert("Employee updated!");
      } else {
        // Add new employee
        await api.post("/employees", {
          employeeNumber,
          firstName,
          lastName,
          position,
          address,
          telephone,
          departmentId,
        });
        alert("Employee added!");
      }
      resetForm();
      fetchEmployees();
    } catch {
      alert("Error saving employee");
    }
  };

  // Handle edit button click - populate form with selected employee data
  const handleEdit = (emp) => {
    setEmployeeNumber(emp.employeeNumber);
    setFirstName(emp.firstName);
    setLastName(emp.lastName);
    setPosition(emp.position);
    setAddress(emp.address);
    setTelephone(emp.telephone);
    setDepartmentId(emp.departmentId);
    setEditingId(emp.id);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    try {
      await api.delete(`/employees/${id}`);
      alert("Employee deleted!");
      fetchEmployees();
      if (editingId === id) resetForm();
    } catch {
      alert("Error deleting employee");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">{editingId ? "Edit Employee" : "Add Employee"}</h2>
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow space-y-4 mb-8">
        <input
          value={employeeNumber}
          onChange={(e) => setEmployeeNumber(e.target.value)}
          placeholder="Employee Number"
          className="w-full border p-2"
          required
        />
        <input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="First Name"
          className="w-full border p-2"
          required
        />
        <input
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Last Name"
          className="w-full border p-2"
          required
        />
        <input
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          placeholder="Position"
          className="w-full border p-2"
          required
        />
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Address"
          className="w-full border p-2"
          required
        />
        <input
          value={telephone}
          onChange={(e) => setTelephone(e.target.value)}
          placeholder="Telephone"
          className="w-full border p-2"
          required
        />
        <select
          value={departmentId}
          onChange={(e) => setDepartmentId(e.target.value)}
          className="w-full border p-2"
          required
        >
          <option value="">Select Department</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.departmentName}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {editingId ? "Update Employee" : "Add Employee"}
        </button>
        {editingId && (
          <button
            type="button"
            className="ml-4 bg-gray-500 text-white px-4 py-2 rounded"
            onClick={resetForm}
          >
            Cancel
          </button>
        )}
      </form>

      <h2 className="text-2xl font-bold mb-4">Employees List</h2>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 p-2">Employee Number</th>
            <th className="border border-gray-300 p-2">First Name</th>
            <th className="border border-gray-300 p-2">Last Name</th>
            <th className="border border-gray-300 p-2">Position</th>
            <th className="border border-gray-300 p-2">Address</th>
            <th className="border border-gray-300 p-2">Telephone</th>
            <th className="border border-gray-300 p-2">Department</th>
            <th className="border border-gray-300 p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.length === 0 && (
            <tr>
              <td colSpan="8" className="text-center p-4">
                No employees found.
              </td>
            </tr>
          )}
          {employees.map((emp) => (
            <tr key={emp.id}>
              <td className="border border-gray-300 p-2">{emp.employeeNumber}</td>
              <td className="border border-gray-300 p-2">{emp.firstName}</td>
              <td className="border border-gray-300 p-2">{emp.lastName}</td>
              <td className="border border-gray-300 p-2">{emp.position}</td>
              <td className="border border-gray-300 p-2">{emp.address}</td>
              <td className="border border-gray-300 p-2">{emp.telephone}</td>
              <td className="border border-gray-300 p-2">{emp.departmentName}</td>
              <td className="border border-gray-300 p-2 space-x-2">
                <button
                  onClick={() => handleEdit(emp)}
                  className="bg-yellow-400 px-2 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(emp.id)}
                  className="bg-red-600 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeForm;
