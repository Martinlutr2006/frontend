import { useEffect, useState } from "react";
import api from "../api";

const CarManager = () => {
  const [cars, setCars] = useState([]);
  const [form, setForm] = useState({
    platenumber: "",
    type: "",
    model: "",
    manufacturing_year: "",
    driver_phone: "",
    mechanic_name: "",
  });
  const [editingPlate, setEditingPlate] = useState(null);

  const fetchCars = async () => {
    try {
      const res = await api.get("/cars");
      setCars(res.data);
    } catch (err) {
      alert("Error fetching cars");
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPlate) {
        await api.put(`/cars/${editingPlate}`, form);
        setEditingPlate(null);
      } else {
        await api.post("/cars", form);
      }
      setForm({
        platenumber: "",
        type: "",
        model: "",
        manufacturing_year: "",
        driver_phone: "",
        mechanic_name: "",
      });
      fetchCars();
    } catch (err) {
      alert("Error submitting car");
    }
  };

  const handleEdit = (car) => {
    setForm({
      platenumber: car.platenumber,
      type: car.type,
      model: car.model,
      manufacturing_year: car.manufacturing_year,
      driver_phone: car.driver_phone,
      mechanic_name: car.mechanic_name,
    });
    setEditingPlate(car.platenumber);
  };

  const handleDelete = async (platenumber) => {
    if (!window.confirm("Are you sure you want to delete this car?")) return;
    try {
      await api.delete(`/cars/${platenumber}`);
      fetchCars();
      if (editingPlate === platenumber) {
        setForm({
          platenumber: "",
          type: "",
          model: "",
          manufacturing_year: "",
          driver_phone: "",
          mechanic_name: "",
        });
        setEditingPlate(null);
      }
    } catch (err) {
      alert("Error deleting car");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Manage Cars</h2>
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow space-y-4 mb-6">
        <input
          name="platenumber"
          value={form.platenumber}
          onChange={handleChange}
          placeholder="Plate Number"
          className="w-full border p-2"
          required
          disabled={editingPlate !== null}
        />
        <input
          name="type"
          value={form.type}
          onChange={handleChange}
          placeholder="Car Type"
          className="w-full border p-2"
          required
        />
        <input
          name="model"
          value={form.model}
          onChange={handleChange}
          placeholder="Model"
          className="w-full border p-2"
          required
        />
        <input
          name="manufacturing_year"
          type="number"
          value={form.manufacturing_year}
          onChange={handleChange}
          placeholder="Manufacturing Year"
          className="w-full border p-2"
          required
        />
        <input
          name="driver_phone"
          value={form.driver_phone}
          onChange={handleChange}
          placeholder="Driver Phone"
          className="w-full border p-2"
          required
        />
        <input
          name="mechanic_name"
          value={form.mechanic_name}
          onChange={handleChange}
          placeholder="Mechanic Name"
          className="w-full border p-2"
          required
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          {editingPlate ? "Update Car" : "Add Car"}
        </button>
      </form>

      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2">Plate Number</th>
            <th className="border px-4 py-2">Type</th>
            <th className="border px-4 py-2">Model</th>
            <th className="border px-4 py-2">Year</th>
            <th className="border px-4 py-2">Driver Phone</th>
            <th className="border px-4 py-2">Mechanic</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {cars.map((car) => (
            <tr key={car.platenumber}>
              <td className="border px-4 py-2">{car.platenumber}</td>
              <td className="border px-4 py-2">{car.type}</td>
              <td className="border px-4 py-2">{car.model}</td>
              <td className="border px-4 py-2">{car.manufacturing_year}</td>
              <td className="border px-4 py-2">{car.driver_phone}</td>
              <td className="border px-4 py-2">{car.mechanic_name}</td>
              <td className="border px-4 py-2 space-x-2">
                <button
                  onClick={() => handleEdit(car)}
                  className="bg-yellow-400 px-2 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(car.platenumber)}
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

export default CarManager; 