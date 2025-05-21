import React, { useState, useEffect } from 'react';
import api from '../api';

function CarManager() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCar, setEditingCar] = useState(null);
  const [formData, setFormData] = useState({
    plate_number: '',
    car_type: '',
    car_size: '',
    driver_name: '',
    driver_phone: ''
  });

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const response = await api.get('/cars');
      setCars(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch cars');
      setLoading(false);
      console.error('Error fetching cars:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCar) {
        // Update existing car
        await api.put(`/cars/${editingCar}`, formData);
        alert('Car updated successfully');
      } else {
        // Add new car
        await api.post('/cars', formData);
        alert('Car added successfully');
      }
      fetchCars();
      resetForm();
    } catch (err) {
      setError(editingCar ? 'Failed to update car' : 'Failed to add car');
      console.error('Error:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdit = (car) => {
    setEditingCar(car.plate_number);
    setFormData({
      plate_number: car.plate_number,
      car_type: car.car_type,
      car_size: car.car_size,
      driver_name: car.driver_name,
      driver_phone: car.driver_phone
    });
  };

  const handleDelete = async (plateNumber) => {
    if (!window.confirm('Are you sure you want to delete this car?')) return;
    
    try {
      const response = await api.delete(`/cars/${plateNumber}`);
      if (response.data.message) {
        alert(response.data.message);
      }
      fetchCars();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete car';
      alert(errorMessage);
      console.error('Error deleting car:', err);
    }
  };

  const resetForm = () => {
    setEditingCar(null);
    setFormData({
      plate_number: '',
      car_type: '',
      car_size: '',
      driver_name: '',
      driver_phone: ''
    });
  };

  if (loading) return <div className="text-center py-4">Loading...</div>;
  if (error) return <div className="text-center text-red-500 py-4">{error}</div>;

  return (
    <div className="space-y-6">
      {/* Form */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900">
            {editingCar ? 'Edit Car' : 'Add New Car'}
          </h3>
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label htmlFor="plate_number" className="block text-sm font-medium text-gray-700">
                  Plate Number
                </label>
                <input
                  type="text"
                  name="plate_number"
                  id="plate_number"
                  value={formData.plate_number}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                  disabled={editingCar !== null}
                />
              </div>
              <div>
                <label htmlFor="car_type" className="block text-sm font-medium text-gray-700">
                  Car Type
                </label>
                <select
                  name="car_type"
                  id="car_type"
                  value={formData.car_type}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                >
                  <option value="">Select type</option>
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="Van">Van</option>
                  <option value="Truck">Truck</option>
                </select>
              </div>
              <div>
                <label htmlFor="car_size" className="block text-sm font-medium text-gray-700">
                  Car Size
                </label>
                <select
                  name="car_size"
                  id="car_size"
                  value={formData.car_size}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                >
                  <option value="">Select size</option>
                  <option value="Small">Small</option>
                  <option value="Medium">Medium</option>
                  <option value="Large">Large</option>
                </select>
              </div>
              <div>
                <label htmlFor="driver_name" className="block text-sm font-medium text-gray-700">
                  Driver Name
                </label>
                <input
                  type="text"
                  name="driver_name"
                  id="driver_name"
                  value={formData.driver_name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="driver_phone" className="block text-sm font-medium text-gray-700">
                  Driver Phone
                </label>
                <input
                  type="tel"
                  name="driver_phone"
                  id="driver_phone"
                  value={formData.driver_phone}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              {editingCar && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {editingCar ? 'Update Car' : 'Add Car'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium text-gray-900">Registered Cars</h3>
        </div>
        <div className="border-t border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plate Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver Phone
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cars.map((car) => (
                  <tr key={car.plate_number}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {car.plate_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {car.car_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {car.car_size}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {car.driver_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {car.driver_phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(car)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(car.plate_number)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CarManager; 