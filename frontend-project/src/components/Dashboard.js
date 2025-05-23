import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
    BuildingOfficeIcon, 
    TruckIcon, 
    CurrencyDollarIcon, 
    ChartBarIcon,
    ClockIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalSlots: 0,
        availableSlots: 0,
        totalCars: 0,
        activeParking: 0,
        totalRevenue: 0,
        averageDuration: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/dashboard/stats', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            } else {
                toast.error('Failed to fetch dashboard statistics');
            }
        } catch (error) {
            toast.error('Error fetching dashboard statistics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const statCards = [
        {
            name: 'Total Parking Slots',
            value: stats.totalSlots,
            icon: BuildingOfficeIcon,
            color: 'bg-blue-500'
        },
        {
            name: 'Available Slots',
            value: stats.availableSlots,
            icon: BuildingOfficeIcon,
            color: 'bg-green-500'
        },
        {
            name: 'Registered Cars',
            value: stats.totalCars,
            icon: TruckIcon,
            color: 'bg-purple-500'
        },
        {
            name: 'Active Parking',
            value: stats.activeParking,
            icon: ClockIcon,
            color: 'bg-yellow-500'
        },
        {
            name: 'Total Revenue',
            value: `$${stats.totalRevenue.toFixed(2)}`,
            icon: CurrencyDollarIcon,
            color: 'bg-indigo-500'
        },
        {
            name: 'Average Duration',
            value: `${Math.floor(stats.averageDuration / 60)}h ${stats.averageDuration % 60}m`,
            icon: ChartBarIcon,
            color: 'bg-pink-500'
        }
    ];

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {statCards.map((stat) => (
                    <div key={stat.name} className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center">
                            <div className={`p-3 rounded-full ${stat.color} bg-opacity-10`}>
                                <stat.icon className={`h-6 w-6 ${stat.color.replace('bg-', 'text-')}`} />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                                <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="mt-8 bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button
                        onClick={() => window.location.href = '/cars'}
                        className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                        <TruckIcon className="h-5 w-5 mr-2" />
                        Register Car
                    </button>
                    <button
                        onClick={() => window.location.href = '/parking-records'}
                        className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                    >
                        <ClockIcon className="h-5 w-5 mr-2" />
                        Record Entry
                    </button>
                    <button
                        onClick={() => window.location.href = '/payments'}
                        className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                        Process Payment
                    </button>
                    <button
                        onClick={() => window.location.href = '/reports'}
                        className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
                    >
                        <ChartBarIcon className="h-5 w-5 mr-2" />
                        View Reports
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;