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
    const [selectedResource, setSelectedResource] = useState(null);

    const [formData, setFormData] = useState({
        resourceId: resourceIdParam || '',
        startTime: '',
        endTime: '',
        quantity: '1',
        purpose: ''
    });

    useEffect(() => {
        if (!resourceIdParam) {
            resourceApi.getAllResources()
                .then(data => {
                    const bookable = data.filter(r =>
                        r.status === 'ACTIVE' && ['SPACE', 'EQUIPMENT', 'UTILITY'].includes(r.category)
                    );
                    setResources(bookable);
                })
                .catch(err => console.error("Failed to fetch resources", err));
            return;
        }

        resourceApi.getResourceById(resourceIdParam)
            .then((resource) => setSelectedResource(resource))
            .catch(err => console.error("Failed to fetch selected resource", err));
    }, [resourceIdParam]);

    useEffect(() => {
        if (!formData.resourceId || resourceIdParam) return;
        const resource = resources.find(r => String(r.id) === String(formData.resourceId));
        setSelectedResource(resource || null);
    }, [formData.resourceId, resourceIdParam, resources]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleQuantityChange = (e) => {
        const { value } = e.target;
        if (value !== '' && !/^\d+$/.test(value)) return;
        setFormData(prev => ({ ...prev, quantity: value }));
    };

    const isInventory = selectedResource && ['EQUIPMENT', 'UTILITY'].includes(selectedResource.category);
    const maxQuantity = selectedResource?.capacity || 1;

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

        if (isInventory) {
            const quantity = Number(formData.quantity);
            if (!quantity || quantity < 1) {
                setError("Please enter a valid quantity.");
                return;
            }
            if (quantity > maxQuantity) {
                setError(`Quantity cannot exceed available inventory count (${maxQuantity}).`);
                return;
            }
        }

        const payload = {
            userId: user.id,
            resourceId: formData.resourceId,
            startTime: formData.startTime,
            endTime: formData.endTime,
            quantity: isInventory ? Number(formData.quantity) : 1,
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
                                {selectedResource && (
                                    <div style={{ marginTop: '4px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                                        {selectedResource.category} · {selectedResource.type?.replace('_', ' ')}
                                    </div>
                                )}
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
                                    <option key={r.id} value={r.id}>
                                        {r.name} ({r.category} · {r.type.replace('_', ' ')})
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {isInventory && (
                        <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                Quantity
                            </label>
                            <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleQuantityChange}
                                className="filter-input"
                                style={{ width: '100%', padding: '10px' }}
                                required
                            />
                            <p className="field-hint" style={{ marginTop: '6px' }}>
                                Available inventory count: {maxQuantity}
                            </p>
                        </div>
                    )}

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
