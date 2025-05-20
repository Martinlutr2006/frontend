import { useEffect, useState } from "react";
import api from "../api";

const Reports = () => {
  const [month, setMonth] = useState("");
  const [report, setReport] = useState([]);

  const fetchReport = async () => {
    if (!month) return;
    try {
      const res = await api.get("/payroll/" + month);
      setReport(res.data);
    } catch (err) {
      alert("Error fetching report");
    }
  };

  useEffect(() => {
    fetchReport();
  }, [month]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Payroll Report</h2>
      <div className="mb-4">
        <label htmlFor="month" className="mr-2 font-semibold">Select Month (1-12):</label>
        <input
          id="month"
          type="number"
          min="1"
          max="12"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border p-2 rounded w-20"
        />
      </div>
      {report.length > 0 ? (
        <table className="w-full border text-left">
          <thead>
            <tr className="bg-gray-200">
              <th>First Name</th>
              <th>Last Name</th>
              <th>Position</th>
              <th>Department</th>
              <th>Net Salary</th>
            </tr>
          </thead>
          <tbody>
            {report.map((r, index) => (
              <tr key={index} className="border-t">
                <td>{r.firstName}</td>
                <td>{r.lastName}</td>
                <td>{r.position}</td>
                <td>{r.departmentName}</td>
                <td>{r.netSalary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No data available for the selected month.</p>
      )}
    </div>
  );
};

export default Reports;
