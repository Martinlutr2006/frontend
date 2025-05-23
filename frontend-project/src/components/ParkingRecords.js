import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from '../config';

const ParkingRecords = () => {
    const [records, setRecords] = useState([]);
    const [cars, setCars] = useState([]);
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        plate_number: '',
        slot_number: ''
    });

    useEffect(() => {
        fetchRecords();
        fetchCars();
        fetchSlots();
    }, []);

    const fetchRecords = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.ACTIVE_PARKING, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setRecords(data);
            } else {
                toast.error('Failed to fetch parking records');
            }
        } catch (error) {
            toast.error('Error fetching parking records');
        } finally {
            setLoading(false);
        }
    };

    const fetchCars = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/cars', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setCars(data);
            }
        } catch (error) {
            toast.error('Error fetching cars');
        }
    };

    const fetchSlots = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/parking-slots', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setSlots(data.filter(slot => slot.slot_status === 'available'));
            }
        } catch (error) {
            toast.error('Error fetching parking slots');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(API_ENDPOINTS.PARKING_RECORDS, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (response.ok) {
                toast.success('Parking record created successfully');
                setFormData({ plate_number: '', slot_number: '' });
                fetchRecords();
            } else {
                toast.error(data.message || 'Failed to create parking record');
            }
        } catch (error) {
            toast.error('Error creating parking record');
        }
    };

    const handleExit = async (recordId) => {
        try {
            const response = await fetch(`${API_ENDPOINTS.PARKING_RECORDS}/${recordId}/exit`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const data = await response.json();
            if (response.ok) {
                toast.success('Exit recorded successfully');
                fetchRecords();
            } else {
                toast.error(data.message || 'Failed to record exit');
            }
        } catch (error) {
            toast.error('Error recording exit');
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-6">Parking Records</h2>

            {/* Entry Form */}
            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-8">
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="plate_number">
                        Car
                    </label>
                    <select
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="plate_number"
                        name="plate_number"
                        value={formData.plate_number}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select a car</option>
                        {cars.map(car => (
                            <option key={car.plate_number} value={car.plate_number}>
                                {car.plate_number} - {car.driver_name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="slot_number">
                        Parking Slot
                    </label>
                    <select
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="slot_number"
                        name="slot_number"
                        value={formData.slot_number}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select a slot</option>
                        {slots.map(slot => (
                            <option key={slot.slot_number} value={slot.slot_number}>
                                {slot.slot_number}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center justify-end">
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="submit"
                    >
                        Record Entry
                    </button>
                </div>
            </form>

            {/* Records List */}
            <div className="bg-white shadow-md rounded px-8 pt-6 pb-8">
                <h3 className="text-xl font-bold mb-4">Current Parking Records</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full table-auto">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="px-4 py-2 text-left">Plate Number</th>
                                <th className="px-4 py-2 text-left">Slot Number</th>
                                <th className="px-4 py-2 text-left">Entry Time</th>
                                <th className="px-4 py-2 text-left">Duration</th>
                                <th className="px-4 py-2 text-left">Status</th>
                                <th className="px-4 py-2 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map((record) => (
                                <tr key={record.record_id} className="border-b">
                                    <td className="px-4 py-2">{record.plate_number}</td>
                                    <td className="px-4 py-2">{record.slot_number}</td>
                                    <td className="px-4 py-2">
                                        {new Date(record.entry_time).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-2">
                                        {record.exit_time
                                            ? `${Math.floor(record.duration / 60)}h ${record.duration % 60}m`
                                            : `${Math.floor((Date.now() - new Date(record.entry_time).getTime()) / 60000)}m`}
                                    </td>
                                    <td className="px-4 py-2">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                record.exit_time
                                                    ? 'bg-gray-500 text-white'
                                                    : 'bg-green-500 text-white'
                                            }`}
                                        >
                                            {record.exit_time ? 'Completed' : 'Active'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2">
                                        {!record.exit_time && (
                                            <button
                                                onClick={() => handleExit(record.record_id)}
                                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
                                            >
                                                Record Exit
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ParkingRecords; 