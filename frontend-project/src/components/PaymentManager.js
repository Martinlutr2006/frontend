import { useEffect, useState } from "react";
import api from "../api";

const PaymentManager = () => {
  const [payments, setPayments] = useState([]);
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState({
    amount_paid: "",
    payment_date: "",
    recordnumber: "",
    user_id: "", // This will be set from the logged-in user's context
  });
  const [dateRange, setDateRange] = useState({
    start_date: "",
    end_date: "",
  });
  const [report, setReport] = useState([]);

  const fetchPayments = async () => {
    try {
      const res = await api.get("/payments");
      setPayments(res.data);
    } catch (err) {
      alert("Error fetching payments");
    }
  };

  const fetchRecords = async () => {
    try {
      const res = await api.get("/servicerecords");
      setRecords(res.data);
    } catch (err) {
      alert("Error fetching service records");
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchRecords();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDateRangeChange = (e) => {
    setDateRange({ ...dateRange, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/payments", form);
      setForm({
        amount_paid: "",
        payment_date: "",
        recordnumber: "",
        user_id: "",
      });
      fetchPayments();
    } catch (err) {
      alert("Error submitting payment");
    }
  };

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    if (!dateRange.start_date || !dateRange.end_date) {
      alert("Please select both start and end dates");
      return;
    }
    try {
      const res = await api.get("/payments/report", {
        params: dateRange,
      });
      setReport(res.data);
    } catch (err) {
      alert("Error generating report");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Payment Management</h2>
      
      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow space-y-4 mb-6">
        <input
          name="payment_date"
          type="date"
          value={form.payment_date}
          onChange={handleChange}
          className="w-full border p-2"
          required
        />
        <input
          name="amount_paid"
          type="number"
          step="0.01"
          value={form.amount_paid}
          onChange={handleChange}
          placeholder="Amount Paid"
          className="w-full border p-2"
          required
        />
        <select
          name="recordnumber"
          value={form.recordnumber}
          onChange={handleChange}
          className="w-full border p-2"
          required
        >
          <option value="">Select Service Record</option>
          {records.map((record) => (
            <option key={record.recordnumber} value={record.recordnumber}>
              Record #{record.recordnumber} - {record.platenumber} ({record.service_name})
            </option>
          ))}
        </select>
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Add Payment
        </button>
      </form>

      {/* Payment Report Form */}
      <div className="bg-white p-4 rounded shadow space-y-4 mb-6">
        <h3 className="font-semibold">Generate Payment Report</h3>
        <form onSubmit={handleGenerateReport} className="flex gap-4">
          <input
            name="start_date"
            type="date"
            value={dateRange.start_date}
            onChange={handleDateRangeChange}
            className="border p-2"
            required
          />
          <input
            name="end_date"
            type="date"
            value={dateRange.end_date}
            onChange={handleDateRangeChange}
            className="border p-2"
            required
          />
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
            Generate Report
          </button>
        </form>
      </div>

      {/* Payments Table */}
      <h3 className="font-semibold mb-2">Recent Payments</h3>
      <table className="w-full border-collapse border mb-6">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2">Payment Number</th>
            <th className="border px-4 py-2">Date</th>
            <th className="border px-4 py-2">Amount</th>
            <th className="border px-4 py-2">Record Number</th>
            <th className="border px-4 py-2">Plate Number</th>
            <th className="border px-4 py-2">Service</th>
            <th className="border px-4 py-2">User</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment.paymentnumber}>
              <td className="border px-4 py-2">{payment.paymentnumber}</td>
              <td className="border px-4 py-2">{new Date(payment.payment_date).toLocaleDateString()}</td>
              <td className="border px-4 py-2">${payment.amount_paid}</td>
              <td className="border px-4 py-2">{payment.recordnumber}</td>
              <td className="border px-4 py-2">{payment.platenumber}</td>
              <td className="border px-4 py-2">{payment.service_name}</td>
              <td className="border px-4 py-2">{payment.username}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Report Table */}
      {report.length > 0 && (
        <>
          <h3 className="font-semibold mb-2">Payment Report</h3>
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-4 py-2">Date</th>
                <th className="border px-4 py-2">User</th>
                <th className="border px-4 py-2">Plate Number</th>
                <th className="border px-4 py-2">Service</th>
                <th className="border px-4 py-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {report.map((item, index) => (
                <tr key={index}>
                  <td className="border px-4 py-2">{new Date(item.payment_date).toLocaleDateString()}</td>
                  <td className="border px-4 py-2">{item.username}</td>
                  <td className="border px-4 py-2">{item.platenumber}</td>
                  <td className="border px-4 py-2">{item.service_name}</td>
                  <td className="border px-4 py-2">${item.amount_paid}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default PaymentManager; 