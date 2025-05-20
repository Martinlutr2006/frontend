import { useEffect, useState } from "react";
import api from "../api";

const ServiceRecordManager = () => {
  const [records, setRecords] = useState([]);
  const [cars, setCars] = useState([]);
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({
    servicedate: "",
    platenumber: "",
    service_code: "",
  });

  const fetchRecords = async () => {
    try {
      const res = await api.get("/servicerecords");
      setRecords(res.data);
    } catch (err) {
      alert("Error fetching service records");
    }
  };

  const fetchCars = async () => {
    try {
      const res = await api.get("/cars");
      setCars(res.data);
    } catch (err) {
      alert("Error fetching cars");
    }
  };

  const fetchServices = async () => {
    try {
      const res = await api.get("/services");
      setServices(res.data);
    } catch (err) {
      alert("Error fetching services");
    }
  };

  useEffect(() => {
    fetchRecords();
    fetchCars();
    fetchServices();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/servicerecords", form);
      setForm({
        servicedate: "",
        platenumber: "",
        service_code: "",
      });
      fetchRecords();
    } catch (err) {
      alert("Error submitting service record");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Service Records</h2>
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow space-y-4 mb-6">
        <input
          name="servicedate"
          type="date"
          value={form.servicedate}
          onChange={handleChange}
          className="w-full border p-2"
          required
        />
        <select
          name="platenumber"
          value={form.platenumber}
          onChange={handleChange}
          className="w-full border p-2"
          required
        >
          <option value="">Select Car</option>
          {cars.map((car) => (
            <option key={car.platenumber} value={car.platenumber}>
              {car.platenumber} - {car.model} ({car.type})
            </option>
          ))}
        </select>
        <select
          name="service_code"
          value={form.service_code}
          onChange={handleChange}
          className="w-full border p-2"
          required
        >
          <option value="">Select Service</option>
          {services.map((service) => (
            <option key={service.service_code} value={service.service_code}>
              {service.service_name} - ${service.price}
            </option>
          ))}
        </select>
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Add Service Record
        </button>
      </form>

      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2">Record Number</th>
            <th className="border px-4 py-2">Service Date</th>
            <th className="border px-4 py-2">Plate Number</th>
            <th className="border px-4 py-2">Car Type</th>
            <th className="border px-4 py-2">Model</th>
            <th className="border px-4 py-2">Service</th>
            <th className="border px-4 py-2">Price</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.recordnumber}>
              <td className="border px-4 py-2">{record.recordnumber}</td>
              <td className="border px-4 py-2">{new Date(record.servicedate).toLocaleDateString()}</td>
              <td className="border px-4 py-2">{record.platenumber}</td>
              <td className="border px-4 py-2">{record.type}</td>
              <td className="border px-4 py-2">{record.model}</td>
              <td className="border px-4 py-2">{record.service_name}</td>
              <td className="border px-4 py-2">${record.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ServiceRecordManager; 