import React, { useState, useEffect } from 'react';
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
            }
        } catch (error) {
            console.error('Error fetching cars:', error);
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

            if (response.ok) {
                setFormData({ plate_number: '', driver_name: '', phone_number: '' });
                fetchCars();
            }
        } catch (error) {
            console.error('Error registering car:', error);
        }
    };

    // ... rest of the component code ...
};

export default Cars;