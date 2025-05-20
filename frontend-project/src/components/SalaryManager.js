import { useEffect, useState } from "react";
import api from "../api";

const SalaryManager = () => {
  const [salaries, setSalaries] = useState([]);
  const [form, setForm] = useState({
    totalDeduction: "",
    netSalary: "",
    month: "",
    employeeId: "",
  });
  const [editingId, setEditingId] = useState(null);

  const fetchSalaries = async () => {
    try {
      const res = await api.get("/salaries");
      setSalaries(res.data);
    } catch (err) {
      alert("Error fetching salaries");
    }
  };

  useEffect(() => {
    fetchSalaries();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/salaries/${editingId}`, form);
        setEditingId(null);
      } else {
        await api.post("/salaries", form);
      }
      setForm({
        totalDeduction: "",
        netSalary: "",
        month: "",
        employeeId: "",
      });
      fetchSalaries();
    } catch (err) {
      alert("Error submitting salary");
    }
  };

  const handleEdit = (salary) => {
    setForm({
      totalDeduction: salary.totalDeduction,
      netSalary: salary.netSalary,
      month: salary.month,
      employeeId: salary.employeeId,
    });
    setEditingId(salary.id);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/salaries/${id}`);
      fetchSalaries();
    } catch (err) {
      alert("Error deleting salary");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Manage Salaries</h2>
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow space-y-4 mb-6">
        <input
          name="employeeId"
          value={form.employeeId}
          onChange={handleChange}
          placeholder="Employee ID"
          className="w-full border p-2"
          required
        />
        <input
          name="totalDeduction"
          value={form.totalDeduction}
          onChange={handleChange}
          placeholder="Total Deduction"
          className="w-full border p-2"
          required
        />
        <input
          name="netSalary"
          value={form.netSalary}
          onChange={handleChange}
          placeholder="Net Salary"
          className="w-full border p-2"
          required
        />
        <input
          name="month"
          type="number"
          min="1"
          max="12"
          value={form.month}
          onChange={handleChange}
          placeholder="Month (1-12)"
          className="w-full border p-2"
          required
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          {editingId ? "Update Salary" : "Add Salary"}
        </button>
      </form>

      <table className="w-full border text-left">
        <thead>
          <tr className="bg-gray-200">
            <th>Employee ID</th>
            <th>Total Deduction</th>
            <th>Net Salary</th>
            <th>Month</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {salaries.map((s) => (
            <tr key={s.id} className="border-t">
              <td>{s.employeeId}</td>
              <td>{s.totalDeduction}</td>
              <td>{s.netSalary}</td>
              <td>{s.month}</td>
              <td>
                <button onClick={() => handleEdit(s)} className="text-blue-600 mr-2">
                  Edit
                </button>
                <button onClick={() => handleDelete(s.id)} className="text-red-600">
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

export default SalaryManager;
