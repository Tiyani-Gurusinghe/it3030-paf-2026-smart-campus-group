import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import resourceApi from '../../features/resources/api/resourceApi';
import { useAuthContext } from '../../features/auth/context/AuthContext';

const ResourceListPage = () => {
    const navigate = useNavigate();
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [resourceToDelete, setResourceToDelete] = useState(null);
    const { isStaff } = useAuthContext();
    
    const [filters, setFilters] = useState({
        category: '',
        type: '',
        minCapacity: ''
    });

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            setLoading(true);
            const data = await resourceApi.getAllResources(filters);
            setResources(data);
            setError(null);
        } catch (err) {
            setError('Failed to load resources. Make sure your Spring Boot backend is running!');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchResources();
    };

    const clearFilters = () => {
        setFilters({ category: '', type: '', minCapacity: '' });
        resourceApi.getAllResources({}).then(setResources).catch(console.error);
    };

    const promptDelete = (resource) => {
        setResourceToDelete(resource);
        setShowDeleteModal(true);
    }

    const confirmDelete = async () => {
        if (!resourceToDelete) return;
        try {
            await resourceApi.deleteResource(resourceToDelete.id);
            setResources(resources.filter(r => r.id !== resourceToDelete.id));
            setShowDeleteModal(false);
            setResourceToDelete(null);
        } catch (err) {
            setError("Failed to delete the resource. Please try again.");
            console.error(err);
        }
    };

    if (loading && resources.length === 0) return <div className="page"><div className="empty-state">Loading catalogue...</div></div>;
    
    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h2 className="page-title">Facilities & Assets</h2>
                    <p className="page-subtitle">Manage campus lecture halls, labs, meeting rooms, and equipment.</p>
                </div>
                {isStaff && (
                    <button onClick={() => navigate('/resources/new')} className="btn primary">
                        + Add Resource
                    </button>
                )}
            </div>

            {error && <div className="error-box">{error}</div>}

            <form onSubmit={handleSearch} className="card" style={{ display: 'flex', gap: '15px', marginBottom: '32px', flexWrap: 'wrap', alignItems: 'center', padding: '16px 24px' }}>
                <div className="filters-bar">
                    <select name="category" value={filters.category} onChange={handleFilterChange} className="filter-input">
                        <option value="">All Categories</option>
                        <option value="BUILDING">Buildings</option>
                        <option value="SPACE">Spaces</option>
                        <option value="EQUIPMENT">Equipment</option>
                        <option value="UTILITY">Utilities</option>
                    </select>
                    <select name="type" value={filters.type} onChange={handleFilterChange} className="filter-input">
                        <option value="">All Types</option>
                        <option value="ACADEMIC">Academic Building</option>
                        <option value="LECTURE_HALL">Lecture Hall</option>
                        <option value="LAB">Lab</option>
                        <option value="MEETING_ROOM">Meeting Room</option>
                        <option value="COMPUTER">Computer</option>
                        <option value="PROJECTOR">Projector</option>
                        <option value="ELECTRICITY">Electricity</option>
                    </select>
                    <input 
                        type="number" 
                        name="minCapacity" 
                        value={filters.minCapacity} 
                        onChange={handleFilterChange} 
                        placeholder="Min Capacity"
                        className="filter-input"
                    />
                </div>
                <button type="submit" className="btn primary" style={{ minWidth: '100px' }}>Search</button>
                <button type="button" onClick={clearFilters} className="btn secondary" style={{ minWidth: '100px' }}>Clear</button>
            </form>
            
            {resources.length === 0 ? (
                <div className="empty-state card">
                    <div className="empty-state-icon">🏢</div>
                    <h3>No resources found</h3>
                    <p>Try adjusting your search filters or add a new resource.</p>
                </div>
            ) : (
                <div className="ticket-grid">
                    {resources.map((resource) => (
                        <div key={resource.id} className="card ticket-card" style={{ display: 'flex', flexDirection: 'column' }}>
                            <div className="card-header">
                                <span className={`status-badge status-${resource.status === 'ACTIVE' ? 'resolved' : 'rejected'}`}>
                                    {resource.status}
                                </span>
                                {resource.parentResource && (
                                    <span style={{fontSize: '11px', background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px', color: 'var(--text-secondary)'}}>
                                        Inside: {resource.parentResource.name}
                                    </span>
                                )}
                            </div>
                            
                            <h3 className="card-title">{resource.name}</h3>
                            <div className="card-category" style={{marginBottom: '10px', fontSize: '12px', fontWeight: 'bold', color: 'var(--primary-color)'}}>
                                {resource.category} - {resource.type}
                            </div>
                            
                            <div className="ticket-meta" style={{ flexGrow: 1 }}>
                                <div className="ticket-meta-item">
                                    <strong>LOCATION</strong>
                                    <span>{resource.location}</span>
                                </div>
                                <div className="ticket-meta-item">
                                    <strong>CAPACITY</strong>
                                    <span>{resource.capacity || 'N/A'}</span>
                                </div>
                                <div className="ticket-meta-item">
                                    <strong>AVAILABILITY</strong>
                                    <span>{resource.availableFrom} - {resource.availableTo}</span>
                                </div>
                            </div>
                            
                            {isStaff && (
                                <div className="card-actions">
                                    <button onClick={() => navigate(`/resources/edit/${resource.id}`)} className="btn secondary" style={{ flex: 1 }}>
                                        Edit
                                    </button>
                                    <button onClick={() => promptDelete(resource)} className="btn danger" style={{ flex: 1 }}>
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Custom Delete Confirmation Modal inline since we don't have a global modal system set up yet */}
            {showDeleteModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000,
                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <div className="card" style={{ maxWidth: '400px', width: '100%', margin: '20px' }}>
                        <h3 style={{ marginBottom: '16px', fontSize: '18px', color: 'var(--text-primary)' }}>Confirm Deletion</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px', lineHeight: '1.5' }}>
                            Are you sure you want to delete <strong>{resourceToDelete?.name}</strong>? This action cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowDeleteModal(false)} className="btn secondary">Cancel</button>
                            <button onClick={confirmDelete} className="btn danger">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResourceListPage;