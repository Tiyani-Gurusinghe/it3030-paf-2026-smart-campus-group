import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import resourceApi from '../../features/resources/api/resourceApi';

const ResourceFormPage = () => {
    const navigate = useNavigate();
    const { id } = useParams(); 
    
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(false);
    const [error, setError] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});

    const [formData, setFormData] = useState({
        name: '',
        category: 'SPACE',
        type: 'LECTURE_HALL',
        parentResourceId: '',
        capacity: '', 
        location: '',
        availableFrom: '08:00:00',
        availableTo: '17:00:00',
        status: 'ACTIVE'
    });

    const [parentOptions, setParentOptions] = useState([]);

    // Fetch parent options based on category
    useEffect(() => {
        const fetchParents = async () => {
            let targetCat = null;
            if (formData.category === 'SPACE') targetCat = 'BUILDING';
            else if (formData.category === 'EQUIPMENT' || formData.category === 'UTILITY') targetCat = 'SPACE';
            
            if (targetCat) {
                try {
                    const res = await resourceApi.getAllResources({ category: targetCat });
                    setParentOptions(res);
                } catch (e) {
                    console.error(e);
                }
            } else {
                setParentOptions([]);
            }
        };
        fetchParents();
    }, [formData.category]);

    useEffect(() => {
        if (id) {
            const fetchResourceForEdit = async () => {
                try {
                    setPageLoading(true);
                    const data = await resourceApi.getResourceById(id);
                    setFormData({
                        name: data.name,
                        category: data.category,
                        type: data.type,
                        parentResourceId: data.parentResource ? data.parentResource.id : '',
                        capacity: data.capacity || '',
                        location: data.location,
                        availableFrom: data.availableFrom,
                        availableTo: data.availableTo,
                        status: data.status
                    });
                } catch (err) {
                    console.error(err);
                    setError('Failed to load resource details for editing.');
                } finally {
                    setPageLoading(false);
                }
            };
            fetchResourceForEdit();
        }
    }, [id]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Clear specific validation error if exists
        if (validationErrors[e.target.name]) {
            setValidationErrors(prev => ({...prev, [e.target.name]: null}));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setValidationErrors({});

        try {
            const payload = {
                ...formData,
                capacity: formData.capacity ? parseInt(formData.capacity) : null,
                parentResource: formData.parentResourceId ? { id: formData.parentResourceId } : null
            };

            if (id) {
                await resourceApi.updateResource(id, payload);
            } else {
                await resourceApi.createResource(payload);
            }
            
            navigate('/resources');
        } catch (err) {
            console.error(err);
            // Check if backend returned validation errors
            if (err.response && err.response.data && err.response.data.validationErrors) {
                setValidationErrors(err.response.data.validationErrors);
                setError("Please correct the errors before submitting.");
            } else {
                setError(`Failed to ${id ? 'update' : 'save'} the resource. Please check your connection.`);
            }
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading) return <div className="page"><div className="empty-state">Loading resource details...</div></div>;

    return (
        <div className="page ticket-form">
            <div className="form-header">
                <h2>{id ? 'Edit Resource' : 'Add New Resource'}</h2>
                <p>{id ? 'Update the details of the existing facility or asset.' : 'Register a new facility or asset into the campus system.'}</p>
            </div>
            
            {error && <div className="error-box">{error}</div>}

            <form onSubmit={handleSubmit} className="card">
                <div className="form-section-title">General Information</div>
                
                <div className="form-grid">
                    <div className="form-field full-width">
                        <label>Asset / Facility Name *</label>
                        <input 
                            required 
                            type="text" 
                            name="name" 
                            value={formData.name} 
                            onChange={handleChange} 
                            placeholder="e.g. Main Auditorium"
                            style={validationErrors.name ? { borderColor: 'var(--priority-high)' } : {}}
                        />
                        {validationErrors.name && <span style={{color: 'var(--priority-high)', fontSize: '11px'}}>{validationErrors.name}</span>}
                    </div>

                    <div className="form-field">
                        <label>Category *</label>
                        <select name="category" value={formData.category} onChange={handleChange}>
                            <option value="BUILDING">Building</option>
                            <option value="SPACE">Space</option>
                            <option value="EQUIPMENT">Equipment</option>
                            <option value="UTILITY">Utility</option>
                        </select>
                    </div>

                    <div className="form-field">
                        <label>Resource Type *</label>
                        <select name="type" value={formData.type} onChange={handleChange}>
                            {formData.category === 'BUILDING' && (
                                <>
                                    <option value="ACADEMIC">Academic Building</option>
                                    <option value="LIBRARY">Library</option>
                                    <option value="ADMINISTRATIVE">Administrative</option>
                                    <option value="HOSTEL">Hostel</option>
                                    <option value="CAFETERIA">Cafeteria</option>
                                </>
                            )}
                            {formData.category === 'SPACE' && (
                                <>
                                    <option value="LECTURE_HALL">Lecture Hall</option>
                                    <option value="LAB">Lab</option>
                                    <option value="MEETING_ROOM">Meeting Room</option>
                                    <option value="CLASSROOM">Classroom</option>
                                    <option value="STUDY_AREA">Study Area</option>
                                    <option value="READING_AREA">Reading Area</option>
                                    <option value="CORRIDOR">Corridor</option>
                                    <option value="OFFICE">Office</option>
                                </>
                            )}
                            {formData.category === 'EQUIPMENT' && (
                                <>
                                    <option value="COMPUTER">Computer</option>
                                    <option value="PROJECTOR">Projector</option>
                                    <option value="FURNITURE">Furniture</option>
                                </>
                            )}
                            {formData.category === 'UTILITY' && (
                                <>
                                    <option value="ELECTRICITY">Electricity</option>
                                    <option value="INTERNET">Internet</option>
                                    <option value="WATER">Water</option>
                                    <option value="SECURITY">Security</option>
                                </>
                            )}
                        </select>
                    </div>

                    {formData.category !== 'BUILDING' && (
                        <div className="form-field full-width">
                            <label>Parent Resource (Located In)</label>
                            <select name="parentResourceId" value={formData.parentResourceId} onChange={handleChange}>
                                <option value="">-- No Parent (Or Root Resource) --</option>
                                {parentOptions.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} ({p.type})</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="form-field">
                        <label>Location *</label>
                        <input 
                            required 
                            type="text" 
                            name="location" 
                            value={formData.location} 
                            onChange={handleChange}
                            placeholder="e.g. Block A, Floor 2"
                            style={validationErrors.location ? { borderColor: 'var(--priority-high)' } : {}}
                        />
                        {validationErrors.location && <span style={{color: 'var(--priority-high)', fontSize: '11px'}}>{validationErrors.location}</span>}
                    </div>

                    <div className="form-field">
                        <label>Capacity</label>
                        <input 
                            type="number" 
                            name="capacity" 
                            value={formData.capacity} 
                            onChange={handleChange}
                            placeholder="Number of seats/items"
                            style={validationErrors.capacity ? { borderColor: 'var(--priority-high)' } : {}}
                        />
                        {validationErrors.capacity && <span style={{color: 'var(--priority-high)', fontSize: '11px'}}>{validationErrors.capacity}</span>}
                    </div>

                    <div className="form-field">
                        <label>Status *</label>
                        <select name="status" value={formData.status} onChange={handleChange}>
                            <option value="ACTIVE">Active</option>
                            <option value="OUT_OF_SERVICE">Out of Service</option>
                        </select>
                    </div>
                </div>

                <div className="form-section-title">Availability Windows</div>
                
                <div className="form-grid">
                    <div className="form-field">
                        <label>Available From</label>
                        <input required type="time" step="1" name="availableFrom" value={formData.availableFrom} onChange={handleChange} />
                    </div>
                    <div className="form-field">
                        <label>Available To</label>
                        <input required type="time" step="1" name="availableTo" value={formData.availableTo} onChange={handleChange} />
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" disabled={loading} className="btn primary">
                        {loading ? 'Saving...' : (id ? 'Update Resource' : 'Save Resource')}
                    </button>
                    <button type="button" onClick={() => navigate('/resources')} className="btn secondary">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ResourceFormPage;