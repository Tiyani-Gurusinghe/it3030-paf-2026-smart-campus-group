import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import resourceApi from '../../features/resources/api/resourceApi';

const ResourceFormPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Initial state matching your Spring Boot backend expectations
    const [formData, setFormData] = useState({
        name: '',
        type: 'LECTURE_HALL', // Default enum
        capacity: '', 
        location: '',
        availableFrom: '08:00:00',
        availableTo: '17:00:00',
        status: 'ACTIVE'
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Clean up capacity to be a number or null
            const payload = {
                ...formData,
                capacity: formData.capacity ? parseInt(formData.capacity) : null
            };

            // Call the API we wrote earlier
            await resourceApi.createResource(payload);
            
            // If successful, navigate back to the list page
            navigate('/resources');
        } catch (err) {
            console.error(err);
            setError('Failed to save the resource. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Add New Resource</h2>
            
            {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', backgroundColor: '#f9f9f9', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                
                <label><strong>Name *</strong></label>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />

                <label><strong>Type *</strong></label>
                <select name="type" value={formData.type} onChange={handleChange} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
                    <option value="LECTURE_HALL">Lecture Hall</option>
                    <option value="LAB">Lab</option>
                    <option value="MEETING_ROOM">Meeting Room</option>
                    <option value="EQUIPMENT">Equipment</option>
                </select>

                <label><strong>Location *</strong></label>
                <input required type="text" name="location" value={formData.location} onChange={handleChange} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />

                <label><strong>Capacity (Optional)</strong></label>
                <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />

                <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <label><strong>Available From</strong></label>
                        <input required type="time" step="1" name="availableFrom" value={formData.availableFrom} onChange={handleChange} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <label><strong>Available To</strong></label>
                        <input required type="time" step="1" name="availableTo" value={formData.availableTo} onChange={handleChange} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                    </div>
                </div>

                <label><strong>Status *</strong></label>
                <select name="status" value={formData.status} onChange={handleChange} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
                    <option value="ACTIVE">Active</option>
                    <option value="OUT_OF_SERVICE">Out of Service</option>
                </select>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button type="submit" disabled={loading} style={{ flex: 1, padding: '12px', backgroundColor: '#0056b3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                        {loading ? 'Saving...' : 'Save Resource'}
                    </button>
                    <button type="button" onClick={() => navigate('/resources')} style={{ padding: '12px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ResourceFormPage;