import { useState, useEffect } from "react";
import api from "../api";

const DepartmentForm = () => {
  const [departmentCode, setDepartmentCode] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [grossSalary, setGrossSalary] = useState("");
  const [departments, setDepartments] = useState([]);

  // For editing
  const [editingId, setEditingId] = useState(null);

  // Fetch departments on load
  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await api.get("/departments");
      setDepartments(res.data);
    } catch {
      alert("Error fetching departments");
    }
  };

  const resetForm = () => {
    setDepartmentCode("");
    setDepartmentName("");
    setGrossSalary("");
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Update department
        await api.put(`/departments/${editingId}`, {
          departmentCode,
          departmentName,
          grossSalary,
        });
        alert("Department updated!");
      } else {
        // Add new department
        await api.post("/departments", {
          departmentCode,
          departmentName,
          grossSalary,
        });
        alert("Department added!");
      }
      resetForm();
      fetchDepartments();
    } catch {
      alert("Error saving department");
    }
  };

  const handleEdit = (dept) => {
    setDepartmentCode(dept.departmentCode);
    setDepartmentName(dept.departmentName);
    setGrossSalary(dept.grossSalary);
    setEditingId(dept.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this department?")) {
      try {
        await api.delete(`/departments/${id}`);
        fetchDepartments();
      } catch {
        alert("Error deleting department");
      }
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">{editingId ? "Edit Department" : "Add Department"}</h2>

      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow space-y-4">
        <input
          value={departmentCode}
          onChange={(e) => setDepartmentCode(e.target.value)}
          placeholder="Department Code"
          className="w-full border p-2"
          required
        />
        <input
          value={departmentName}
          onChange={(e) => setDepartmentName(e.target.value)}
          placeholder="Department Name"
          className="w-full border p-2"
          required
        />
        <input
          value={grossSalary}
          onChange={(e) => setGrossSalary(e.target.value)}
          placeholder="Gross Salary"
          className="w-full border p-2"
          type="number"
          required
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          {editingId ? "Update" : "Add"}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={resetForm}
            className="ml-4 bg-gray-600 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
        )}
      </form>

      {/* Departments List */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Departments</h3>
        {departments.length === 0 ? (
          <p>No departments found.</p>
        ) : (
          <table className="w-full border-collapse border">
            <thead>
              <tr>
                <th className="border px-4 py-2">Code</th>
                <th className="border px-4 py-2">Name</th>
                <th className="border px-4 py-2">Gross Salary</th>
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => (
                <tr key={dept.id}>
                  <td className="border px-4 py-2">{dept.departmentCode}</td>
                  <td className="border px-4 py-2">{dept.departmentName}</td>
                  <td className="border px-4 py-2">{dept.grossSalary}</td>
                  <td className="border px-4 py-2 space-x-2">
                    <button
                      onClick={() => handleEdit(dept)}
                      className="bg-yellow-400 px-2 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(dept.id)}
                      className="bg-red-600 text-white px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DepartmentForm;
