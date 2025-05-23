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
import { API_ENDPOINTS } from '../config';

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
            const response = await fetch(API_ENDPOINTS.DASHBOARD_STATS, {
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
            value: `${stats.totalRevenue.toLocaleString('en-RW')} RWF`,
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
        // ... rest of the existing code ...
    );
};

export default Dashboard;