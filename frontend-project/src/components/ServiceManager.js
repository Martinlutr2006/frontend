import { useEffect, useState } from "react";
import api from "../api";

const ServiceManager = () => {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({
    service_code: "",
    service_name: "",
    price: "",
  });
  const [editingCode, setEditingCode] = useState(null);

  const fetchServices = async () => {
    try {
      const res = await api.get("/services");
      setServices(res.data);
    } catch (err) {
      alert("Error fetching services");
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCode) {
        await api.put(`/services/${editingCode}`, form);
        setEditingCode(null);
      } else {
        await api.post("/services", form);
      }
      setForm({
        service_code: "",
        service_name: "",
        price: "",
      });
      fetchServices();
    } catch (err) {
      alert("Error submitting service");
    }
  };

  const handleEdit = (service) => {
    setForm({
      service_code: service.service_code,
      service_name: service.service_name,
      price: service.price,
    });
    setEditingCode(service.service_code);
  };

  const handleDelete = async (code) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;
    try {
      await api.delete(`/services/${code}`);
      fetchServices();
      if (editingCode === code) {
        setForm({
          service_code: "",
          service_name: "",
          price: "",
        });
        setEditingCode(null);
      }
    } catch (err) {
      alert("Error deleting service");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Manage Services</h2>
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow space-y-4 mb-6">
        <input
          name="service_code"
          value={form.service_code}
          onChange={handleChange}
          placeholder="Service Code"
          className="w-full border p-2"
          required
          disabled={editingCode !== null}
        />
        <input
          name="service_name"
          value={form.service_name}
          onChange={handleChange}
          placeholder="Service Name"
          className="w-full border p-2"
          required
        />
        <input
          name="price"
          type="number"
          value={form.price}
          onChange={handleChange}
          placeholder="Price"
          className="w-full border p-2"
          required
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          {editingCode ? "Update Service" : "Add Service"}
        </button>
      </form>

      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2">Service Code</th>
            <th className="border px-4 py-2">Service Name</th>
            <th className="border px-4 py-2">Price</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {services.map((service) => (
            <tr key={service.service_code}>
              <td className="border px-4 py-2">{service.service_code}</td>
              <td className="border px-4 py-2">{service.service_name}</td>
              <td className="border px-4 py-2">{service.price}</td>
              <td className="border px-4 py-2 space-x-2">
                <button
                  onClick={() => handleEdit(service)}
                  className="bg-yellow-400 px-2 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(service.service_code)}
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

export default ServiceManager; 