import React, { useState, useEffect } from 'react';
import axios from 'axios';

function StockOutManager() {
  const [stockOutRecords, setStockOutRecords] = useState([]);
  const [spareParts, setSpareParts] = useState([]);
  const [formData, setFormData] = useState({
    part_id: '',
    stock_out_quantity: '',
    stock_out_unit_price: '',
    stock_out_date: new Date().toISOString().split('T')[0]
  });
  const [editingRecord, setEditingRecord] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchStockOutRecords();
    fetchSpareParts();
  }, []);

  const fetchStockOutRecords = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3012/stock-out', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStockOutRecords(response.data);
    } catch (err) {
      setError('Failed to fetch stock out records');
    }
  };

  const fetchSpareParts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3012/spare-parts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSpareParts(response.data);
    } catch (err) {
      setError('Failed to fetch spare parts');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // If part_id changes, update unit_price
    if (name === 'part_id') {
      const selectedPart = spareParts.find(part => part.part_id === parseInt(value));
      if (selectedPart) {
        setFormData(prev => ({
          ...prev,
          stock_out_unit_price: selectedPart.unit_price.toString()
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const data = {
        ...formData,
        part_id: parseInt(formData.part_id),
        stock_out_quantity: parseInt(formData.stock_out_quantity),
        stock_out_unit_price: parseFloat(formData.stock_out_unit_price)
      };

      if (editingRecord) {
        await axios.put(
          `http://localhost:3012/stock-out/${editingRecord.stock_out_id}`,
          data,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('Stock out record updated successfully');
      } else {
        await axios.post(
          'http://localhost:3012/stock-out',
          data,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('Stock out record added successfully');
      }

      setFormData({
        part_id: '',
        stock_out_quantity: '',
        stock_out_unit_price: '',
        stock_out_date: new Date().toISOString().split('T')[0]
      });
      setEditingRecord(null);
      fetchStockOutRecords();
      fetchSpareParts(); // Refresh spare parts to get updated quantities
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save stock out record');
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormData({
      part_id: record.part_id.toString(),
      stock_out_quantity: record.stock_out_quantity.toString(),
      stock_out_unit_price: record.stock_out_unit_price.toString(),
      stock_out_date: new Date(record.stock_out_date).toISOString().split('T')[0]
    });
  };

  const handleDelete = async (stockOutId) => {
    if (!window.confirm('Are you sure you want to delete this record?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:3012/stock-out/${stockOutId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Stock out record deleted successfully');
      fetchStockOutRecords();
      fetchSpareParts(); // Refresh spare parts to get updated quantities
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete stock out record');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">
          {editingRecord ? 'Edit Stock Out Record' : 'Add Stock Out Record'}
        </h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Spare Part</label>
              <select
                name="part_id"
                value={formData.part_id}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={editingRecord !== null}
              >
                <option value="">Select a spare part</option>
                {spareParts.map(part => (
                  <option key={part.part_id} value={part.part_id}>
                    {part.name} (Available: {part.quantity})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Stock Out Date</label>
              <input
                type="date"
                name="stock_out_date"
                value={formData.stock_out_date}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Quantity</label>
              <input
                type="number"
                name="stock_out_quantity"
                value={formData.stock_out_quantity}
                onChange={handleInputChange}
                required
                min="1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Unit Price</label>
              <input
                type="number"
                name="stock_out_unit_price"
                value={formData.stock_out_unit_price}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            {editingRecord && (
              <button
                type="button"
                onClick={() => {
                  setEditingRecord(null);
                  setFormData({
                    part_id: '',
                    stock_out_quantity: '',
                    stock_out_unit_price: '',
                    stock_out_date: new Date().toISOString().split('T')[0]
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              {editingRecord ? 'Update' : 'Add'} Stock Out Record
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <h2 className="text-2xl font-bold p-6 border-b">Stock Out Records</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Part Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stockOutRecords.map((record) => (
                <tr key={record.stock_out_id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(record.stock_out_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.part_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.stock_out_quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${record.stock_out_unit_price}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${record.stock_out_total_price}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                    <button
                      onClick={() => handleEdit(record)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(record.stock_out_id)}
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
  );
}

export default StockOutManager; 