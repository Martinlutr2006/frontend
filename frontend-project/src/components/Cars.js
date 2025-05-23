import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from '../config';

const Cars = () => {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        plate_number: '',
        driver_name: '',
        phone_number: ''
    });

    useEffect(() => {
        fetchCars();
    }, []);

    const fetchCars = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.CARS, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setCars(data);
            } else {
                toast.error('Failed to fetch cars');
            }
        } catch (error) {
            toast.error('Error fetching cars');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(API_ENDPOINTS.CARS, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (response.ok) {
                toast.success('Car registered successfully');
                setFormData({ plate_number: '', driver_name: '', phone_number: '' });
                fetchCars();
            } else {
                toast.error(data.message || 'Failed to register car');
            }
        } catch (error) {
            toast.error('Error registering car');
        }
    };

    // ... rest of the component code ...
};

export default Cars;