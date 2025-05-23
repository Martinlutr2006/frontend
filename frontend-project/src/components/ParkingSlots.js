import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from '../config';

const ParkingSlots = () => {
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSlots();
    }, []);

    const fetchSlots = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.PARKING_SLOTS, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setSlots(data);
            } else {
                toast.error('Failed to fetch parking slots');
            }
        } catch (error) {
            toast.error('Error fetching parking slots');
        } finally {
            setLoading(false);
        }
    };

    const updateSlotStatus = async (slotNumber, newStatus) => {
        try {
            const response = await fetch(`${API_ENDPOINTS.PARKING_SLOTS}/${slotNumber}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ slot_status: newStatus })
            });

            if (response.ok) {
                toast.success('Slot status updated');
                fetchSlots();
            } else {
                const data = await response.json();
                toast.error(data.message || 'Failed to update slot status');
            }
        } catch (error) {
            toast.error('Error updating slot status');
        }
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
            <h2 className="text-2xl font-bold mb-6">Parking Slots</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {slots.map((slot) => (
                    <div
                        key={slot.slot_number}
                        className={`p-6 rounded-lg shadow-md ${
                            slot.slot_status === 'available'
                                ? 'bg-green-100 border-green-500'
                                : 'bg-red-100 border-red-500'
                        } border-2`}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">{slot.slot_number}</h3>
                            <span
                                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                    slot.slot_status === 'available'
                                        ? 'bg-green-500 text-white'
                                        : 'bg-red-500 text-white'
                                }`}
                            >
                                {slot.slot_status}
                            </span>
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-4">
                            Last Updated: {new Date(slot.updated_at).toLocaleString()}
                        </div>

                        <button
                            onClick={() => updateSlotStatus(
                                slot.slot_number,
                                slot.slot_status === 'available' ? 'occupied' : 'available'
                            )}
                            className={`w-full py-2 px-4 rounded font-semibold ${
                                slot.slot_status === 'available'
                                    ? 'bg-red-500 hover:bg-red-600 text-white'
                                    : 'bg-green-500 hover:bg-green-600 text-white'
                            }`}
                        >
                            {slot.slot_status === 'available' ? 'Mark as Occupied' : 'Mark as Available'}
                        </button>
                    </div>
                ))}
            </div>

            <div className="mt-8 bg-white shadow-md rounded px-8 pt-6 pb-8">
                <h3 className="text-xl font-bold mb-4">Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-100 p-4 rounded-lg">
                        <p className="text-lg font-semibold text-green-800">
                            Available Slots: {slots.filter(slot => slot.slot_status === 'available').length}
                        </p>
                    </div>
                    <div className="bg-red-100 p-4 rounded-lg">
                        <p className="text-lg font-semibold text-red-800">
                            Occupied Slots: {slots.filter(slot => slot.slot_status === 'occupied').length}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ParkingSlots; 