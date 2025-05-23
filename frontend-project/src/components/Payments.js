import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from '../config';

const Payments = () => {
    const [payments, setPayments] = useState([]);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        record_id: '',
        amount_paid: ''
    });

    useEffect(() => {
        fetchPayments();
        fetchActiveRecords();
    }, []);

    const fetchPayments = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.PAYMENTS, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setPayments(data);
            } else {
                toast.error('Failed to fetch payments');
            }
        } catch (error) {
            toast.error('Error fetching payments');
        } finally {
            setLoading(false);
        }
    };

    const fetchActiveRecords = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/parking-records/active', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setRecords(data);
            }
        } catch (error) {
            toast.error('Error fetching active records');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(API_ENDPOINTS.PAYMENTS, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (response.ok) {
                toast.success('Payment recorded successfully');
                setFormData({ record_id: '', amount_paid: '' });
                fetchPayments();
                fetchActiveRecords();
            } else {
                toast.error(data.message || 'Failed to record payment');
            }
        } catch (error) {
            toast.error('Error recording payment');
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const calculateAmount = (record) => {
        const duration = Math.floor((Date.now() - new Date(record.entry_time).getTime()) / 60000);
        const hours = Math.ceil(duration / 60);
        // Assuming rate is $2 per hour
        return (hours * 2).toFixed(2);
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
            <h2 className="text-2xl font-bold mb-6">Payments</h2>

            {/* Payment Form */}
            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-8">
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="record_id">
                        Parking Record
                    </label>
                    <select
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="record_id"
                        name="record_id"
                        value={formData.record_id}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select a parking record</option>
                        {records.map(record => (
                            <option key={record.record_id} value={record.record_id}>
                                {record.plate_number} - {record.slot_number} (Duration: {Math.floor((Date.now() - new Date(record.entry_time).getTime()) / 60000)}m)
                            </option>
                        ))}
                    </select>
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="amount_paid">
                        Amount ($)
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="amount_paid"
                        type="number"
                        step="0.01"
                        min="0"
                        name="amount_paid"
                        value={formData.amount_paid}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="flex items-center justify-end">
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="submit"
                    >
                        Record Payment
                    </button>
                </div>
            </form>

            {/* Payments List */}
            <div className="bg-white shadow-md rounded px-8 pt-6 pb-8">
                <h3 className="text-xl font-bold mb-4">Payment History</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full table-auto">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="px-4 py-2 text-left">Payment ID</th>
                                <th className="px-4 py-2 text-left">Plate Number</th>
                                <th className="px-4 py-2 text-left">Slot Number</th>
                                <th className="px-4 py-2 text-left">Amount</th>
                                <th className="px-4 py-2 text-left">Payment Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map((payment) => (
                                <tr key={payment.payment_id} className="border-b">
                                    <td className="px-4 py-2">{payment.payment_id}</td>
                                    <td className="px-4 py-2">{payment.plate_number}</td>
                                    <td className="px-4 py-2">{payment.slot_number}</td>
                                    <td className="px-4 py-2">${payment.amount_paid.toFixed(2)}</td>
                                    <td className="px-4 py-2">
                                        {new Date(payment.payment_date).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Summary */}
                <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="bg-blue-100 p-4 rounded-lg">
                        <p className="text-lg font-semibold text-blue-800">
                            Total Payments: ${payments.reduce((sum, payment) => sum + payment.amount_paid, 0).toFixed(2)}
                        </p>
                    </div>
                    <div className="bg-green-100 p-4 rounded-lg">
                        <p className="text-lg font-semibold text-green-800">
                            Total Transactions: {payments.length}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payments; 