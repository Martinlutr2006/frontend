import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config';

const Reports = () => {
    const [reports, setReports] = useState({
        dailyRevenue: [],
        occupancyRate: [],
        popularSlots: []
    });
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchReports();
    }, [dateRange]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                `${API_ENDPOINTS.REPORTS}?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            if (response.ok) {
                const data = await response.json();
                setReports(data);
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (e) => {
        setDateRange({
            ...dateRange,
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
            <h2 className="text-2xl font-bold mb-6">Reports</h2>

            {/* Date Range Selector */}
            <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-8">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="startDate">
                            Start Date
                        </label>
                        <input
                            type="date"
                            id="startDate"
                            name="startDate"
                            value={dateRange.startDate}
                            onChange={handleDateChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="endDate">
                            End Date
                        </label>
                        <input
                            type="date"
                            id="endDate"
                            name="endDate"
                            value={dateRange.endDate}
                            onChange={handleDateChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                </div>
            </div>

            {/* Daily Revenue Report */}
            <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-8">
                <h3 className="text-xl font-bold mb-4">Daily Revenue</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full table-auto">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="px-4 py-2 text-left">Date</th>
                                <th className="px-4 py-2 text-left">Total Revenue</th>
                                <th className="px-4 py-2 text-left">Transactions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.dailyRevenue.map((day) => (
                                <tr key={day.payment_date} className="border-b">
                                    <td className="px-4 py-2">{new Date(day.payment_date).toLocaleDateString()}</td>
                                    <td className="px-4 py-2">{day.total_revenue.toLocaleString('en-RW')} RWF</td>
                                    <td className="px-4 py-2">{day.total_transactions}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Occupancy Rate Report */}
            <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-8">
                <h3 className="text-xl font-bold mb-4">Occupancy Rate</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reports.occupancyRate.map((rate) => (
                        <div key={rate.date} className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-lg font-semibold text-blue-800">
                                {new Date(rate.date).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-blue-600">
                                Average Occupancy: {(rate.occupancy_rate * 100).toFixed(1)}%
                            </p>
                            <p className="text-sm text-blue-600">
                                Peak Hours: {rate.peak_hours.join(', ')}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Popular Slots Report */}
            <div className="bg-white shadow-md rounded px-8 pt-6 pb-8">
                <h3 className="text-xl font-bold mb-4">Popular Parking Slots</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {reports.popularSlots.map((slot) => (
                        <div key={slot.slot_number} className="bg-green-50 p-4 rounded-lg">
                            <p className="text-lg font-semibold text-green-800">
                                Slot {slot.slot_number}
                            </p>
                            <p className="text-sm text-green-600">
                                Total Usage: {slot.total_usage} times
                            </p>
                            <p className="text-sm text-green-600">
                                Average Duration: {Math.floor(slot.avg_duration / 60)}h {slot.avg_duration % 60}m
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Summary Statistics */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-100 p-4 rounded-lg">
                    <p className="text-lg font-semibold text-blue-800">
                        Total Revenue: {reports.dailyRevenue.reduce((sum, day) => sum + day.total_revenue, 0).toLocaleString('en-RW')} RWF
                    </p>
                </div>
                <div className="bg-green-100 p-4 rounded-lg">
                    <p className="text-lg font-semibold text-green-800">
                        Total Transactions: {reports.dailyRevenue.reduce((sum, day) => sum + day.total_transactions, 0)}
                    </p>
                </div>
                <div className="bg-purple-100 p-4 rounded-lg">
                    <p className="text-lg font-semibold text-purple-800">
                        Average Occupancy: {(reports.occupancyRate.reduce((sum, rate) => sum + rate.occupancy_rate, 0) / reports.occupancyRate.length * 100).toFixed(1)}%
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Reports; 