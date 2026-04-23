import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { bookingApi } from '../../features/bookings/api/bookingApi';
import resourceApi from '../../features/resources/api/resourceApi';
import { useAuthContext } from '../../features/auth/context/AuthContext';

const BookingFormPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const resourceIdParam = searchParams.get('resourceId');
    const resourceNameParam = searchParams.get('resourceName');

    const { user } = useAuthContext();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [resources, setResources] = useState([]);

    const [formData, setFormData] = useState({
        resourceId: resourceIdParam || '',
        startTime: '',
        endTime: '',
        purpose: ''
    });

    useEffect(() => {
        // If not pre-selected, fetch all active resources to populate a dropdown
        if (!resourceIdParam) {
            resourceApi.getAllResources()
                .then(data => {
                    // Filter for active spaces & equipment typically bookable
                    const bookable = data.filter(r => r.status === 'ACTIVE' && (r.category === 'SPACE' || r.category === 'EQUIPMENT'));
                    setResources(bookable);
                })
                .catch(err => console.error("Failed to fetch resources", err));
        }
    }, [resourceIdParam]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!formData.resourceId || !formData.startTime || !formData.endTime || !formData.purpose) {
            setError("Please fill in all fields.");
            return;
        }

        if (!user || !user.id) {
            setError("User not authenticated.");
            return;
        }

        const payload = {
            userId: user.id,
            resourceId: formData.resourceId,
            startTime: formData.startTime,
            endTime: formData.endTime,
            purpose: formData.purpose,
            bookingDate: formData.startTime.split("T")[0]
        };

        try {
            setLoading(true);
            await bookingApi.create(payload);
            navigate('/bookings'); // Redirect to bookings list
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError("Failed to create booking. It might conflict with an existing one.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <div className="page-header">
                <h2 className="page-title">New Booking</h2>
                <p className="page-subtitle">Reserve a campus resource for your activities.</p>
            </div>

            {error && <div className="error-box">{error}</div>}

            <div className="card" style={{ maxWidth: '600px', padding: '24px' }}>
                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Resource</label>
                        {resourceIdParam ? (
                            <div style={{ padding: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                                <strong>{resourceNameParam || 'Selected Resource'}</strong>
                            </div>
                        ) : (
                            <select 
                                name="resourceId" 
                                value={formData.resourceId} 
                                onChange={handleChange}
                                className="filter-input" 
                                style={{ width: '100%', padding: '10px' }}
                                required
                            >
                                <option value="">-- Select a Resource --</option>
                                {resources.map(r => (
                                    <option key={r.id} value={r.id}>{r.name} ({r.type.replace('_', ' ')})</option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Start Time</label>
                        <input 
                            type="datetime-local" 
                            name="startTime" 
                            value={formData.startTime} 
                            onChange={handleChange} 
                            className="filter-input"
                            style={{ width: '100%', padding: '10px' }}
                            required
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>End Time</label>
                        <input 
                            type="datetime-local" 
                            name="endTime" 
                            value={formData.endTime} 
                            onChange={handleChange} 
                            className="filter-input"
                            style={{ width: '100%', padding: '10px' }}
                            required
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '24px' }}>
                        <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Purpose / Remarks</label>
                        <textarea 
                            name="purpose" 
                            value={formData.purpose} 
                            onChange={handleChange} 
                            className="filter-input"
                            style={{ width: '100%', padding: '10px', minHeight: '100px', resize: 'vertical' }}
                            placeholder="Briefly describe the purpose of this booking..."
                            required
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <button type="button" onClick={() => navigate(-1)} className="btn secondary">Cancel</button>
                        <button type="submit" disabled={loading} className="btn primary">
                            {loading ? 'Submitting...' : 'Confirm Booking'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookingFormPage;