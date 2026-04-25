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
    //const { isStaff } = useAuthContext();
    const { isStaff, user, primaryRole } = useAuthContext();
    // // Create a combined permission check
    // const canManage = isStaff || primaryRole === 'ADMIN' || user?.primaryRole === 'ADMIN';
    
    // Since we fixed AuthContext, isStaff now means (Admin OR Technician)
const canManage = isStaff; 

//console.log("Can Manage Resources:", canManage);

//console.log("Can Manage Resources:", canManage);
    
    const [activeTab, setActiveTab] = useState('infrastructure');
    const [activeInventoryTab, setActiveInventoryTab] = useState('ALL');
    const [selectedSpaceId, setSelectedSpaceId] = useState(null);
    
    // Infrastructure Drill-Down States
    const [buildings, setBuildings] = useState([]);
    const [selectedBuildingId, setSelectedBuildingId] = useState('');
    const [faculties, setFaculties] = useState([]);
    const [selectedFaculty, setSelectedFaculty] = useState('');
    const [floors, setFloors] = useState([]);
    const [selectedFloor, setSelectedFloor] = useState('');

    useEffect(() => {
        resetDrillDown();
        if (activeTab === 'infrastructure') {
            loadBuildings();
        } else {
            loadInventory();
        }
    }, [activeTab]);

    const loadBuildings = async () => {
        try {
            setLoading(true);
            const b_data = await resourceApi.getAllResources({ category: 'BUILDING' });
            setBuildings(b_data);
            setResources(b_data); // Only show buildings initially per user request!
            
            setError(null);
        } catch (err) {
            setError('Failed to load infrastructure.');
        } finally {
            setLoading(false);
        }
    };

    const loadInventory = async () => {
        try {
            setLoading(true);
            const eqs = await resourceApi.getAllResources({ category: 'EQUIPMENT' });
            const uts = await resourceApi.getAllResources({ category: 'UTILITY' });
            // Aggregate complete inventory list across all deployment endpoints
            const allInventory = [...eqs, ...uts];
            setResources(allInventory);
            setError(null);
        } catch (err) {
            setError('Failed to load inventory.');
        } finally {
            setLoading(false);
        }
    };

    // When a building is selected
    useEffect(() => {
        if (selectedBuildingId) {
            resourceApi.getFacultiesByBuilding(selectedBuildingId).then(setFaculties).catch(console.error);
            setSelectedFaculty('');
            setFloors([]);
            setSelectedFloor('');
            
            // Clear current resources to mathematically trigger intermediate Faculty Card render!
            setResources([]);
        } else if (activeTab === 'infrastructure' && !loading && !selectedFaculty) {
            loadBuildings();
            setFaculties([]);
        }
    }, [selectedBuildingId]);

    // When a faculty is selected
    useEffect(() => {
        if (selectedFaculty) {
            resourceApi.getFloorsByFaculty(selectedFaculty).then(setFloors).catch(console.error);
            setSelectedFloor('');
            
            // Fetch spaces assigned to this faculty
            resourceApi.getAllResources({ category: 'SPACE', faculty: selectedFaculty })
                .then(data => {
                    if (selectedBuildingId) {
                        const filteredByBuilding = data.filter(r => r.parentResource && String(r.parentResource.id) === String(selectedBuildingId));
                        setResources(filteredByBuilding);
                    } else {
                        // Global search!
                        setResources(data);
                    }
                }).catch(console.error);
        } else if (selectedBuildingId) {
            // Deselected faculty: clear spaces to show Faculty Cards again
            setFloors([]);
            setResources([]);
        } else if (!selectedBuildingId && activeTab === 'infrastructure' && !loading) {
            // Global faculty deselected, go back to root buildings
            setFloors([]);
            loadBuildings();
        }
    }, [selectedFaculty, selectedBuildingId]);

    // When a floor is selected
    useEffect(() => {
        if (selectedFloor && selectedFaculty) {
            resourceApi.getAllResources({ category: 'SPACE', faculty: selectedFaculty, floor: selectedFloor })
                .then(data => {
                    if (selectedBuildingId) {
                        const filtered = data.filter(r => r.parentResource && String(r.parentResource.id) === String(selectedBuildingId));
                        setResources(filtered);
                    } else {
                        setResources(data);
                    }
                }).catch(console.error);
        } else if (selectedFaculty && !selectedFloor) {
            // Revert back to all spaces in the faculty
            resourceApi.getAllResources({ category: 'SPACE', faculty: selectedFaculty })
                .then(data => {
                    if (selectedBuildingId) {
                        const filtered = data.filter(r => r.parentResource && String(r.parentResource.id) === String(selectedBuildingId));
                        setResources(filtered);
                    } else {
                        setResources(data);
                    }
                }).catch(console.error);
        }
    }, [selectedFloor]);

    const resetDrillDown = () => {
        setSelectedBuildingId('');
        setSelectedFaculty('');
        setSelectedFloor('');
        setSelectedSpaceId(null);
        setFaculties([]);
        setFloors([]);
        setActiveInventoryTab('ALL');
        
        if (activeTab === 'infrastructure') loadBuildings();
        else loadInventory();
    };

    const promptDelete = (resource) => {
        setResourceToDelete(resource);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!resourceToDelete) return;
        try {
            await resourceApi.deleteResource(resourceToDelete.id);
            setResources(resources.filter(r => r.id !== resourceToDelete.id));
            setShowDeleteModal(false);
            setResourceToDelete(null);
        } catch (err) {
            const message =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err.message ||
                "Failed to delete the resource. Please try again.";
            setError(message);
            console.error(err);
        }
    };

    if (loading && resources.length === 0) return <div className="page"><div className="empty-state">Loading catalogue...</div></div>;
    
    const displayedResources = activeTab === 'inventory' && activeInventoryTab !== 'ALL' 
        ? resources.filter(r => r.type === activeInventoryTab) 
        : resources;

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h2 className="page-title">Facilities & Assets</h2>
                    <p className="page-subtitle">Manage campus lecture halls, labs, meeting rooms, and equipment.</p>
                </div>
                {canManage && (
                    <button onClick={() => navigate('/resources/new')} className="btn primary">
                        + Add Resource
                    </button>
                )}
            </div>

            {error && <div className="error-box">{error}</div>}

            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
                <button 
                    className={`btn ${activeTab === 'infrastructure' ? 'primary' : 'secondary'}`} 
                    onClick={() => setActiveTab('infrastructure')}
                    style={{ flex: 1, padding: '12px', fontSize: '16px' }}>
                    Infrastructure (Buildings and Spaces)
                </button>
                <button 
                    className={`btn ${activeTab === 'inventory' ? 'primary' : 'secondary'}`} 
                    onClick={() => setActiveTab('inventory')}
                    style={{ flex: 1, padding: '12px', fontSize: '16px' }}>
                    Inventory (Standalone Assets)
                </button>
            </div>

            {activeTab === 'infrastructure' && (
                <div className="card" style={{ display: 'flex', gap: '15px', marginBottom: '32px', flexWrap: 'wrap', alignItems: 'center', padding: '16px 24px' }}>
                    <div className="filters-bar" style={{ flexGrow: 1, display: 'flex', gap: '15px' }}>
                        <select value={selectedBuildingId} onChange={(e) => setSelectedBuildingId(e.target.value)} className="filter-input" style={{flex: 1}}>
                            <option value="">-- All Buildings --</option>
                            {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                        
                        <select value={selectedFaculty} onChange={(e) => setSelectedFaculty(e.target.value)} className="filter-input" style={{flex: 1}}>
                            <option value="">-- {selectedBuildingId ? 'Select Faculty in Building' : 'All Campuses (Global Faculty Search)'} --</option>
                            {(selectedBuildingId ? faculties : ['COMPUTING', 'BUSINESS', 'ENGINEERING', 'HUMANITIES_AND_SCIENCES', 'ARCHITECTURE', 'GRADUATE_STUDIES', 'INTERNATIONAL_PROGRAMMES', 'GENERAL']).map(f => <option key={f} value={f}>{f.replace('_', ' ')}</option>)}
                        </select>

                        <select value={selectedFloor} onChange={(e) => setSelectedFloor(e.target.value)} disabled={!selectedFaculty} className="filter-input" style={{flex: 1}}>
                            <option value="">-- Select Floor --</option>
                            {floors.map(fl => <option key={fl} value={fl}>{fl}</option>)}
                        </select>
                    </div>
                    <button type="button" onClick={resetDrillDown} className="btn secondary" style={{ minWidth: '100px' }}>Reset</button>
                </div>
            )}
            
            {activeTab === 'inventory' && (
                <div className="card" style={{ padding: '16px 24px', marginBottom: '24px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {['ALL', 'PC', 'SMART_BOARD', 'TABLE', 'CHAIR', 'PROJECTOR', 'CAMERA', 'WHITE_BOARD', 'SCREEN'].map(cat => (
                        <button key={cat} type="button"
                                onClick={() => setActiveInventoryTab(cat)} 
                                className={`btn ${activeInventoryTab === cat ? 'primary' : 'secondary'}`} 
                                style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '20px' }}>
                            {cat.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            )}
            
            {selectedSpaceId ? (() => {
                 const currentSpace = resources.find(r => r.id === selectedSpaceId);
                 if (!currentSpace) return null;
                 return (
                     <div className="card space-detail-view" style={{ padding: '32px' }}>
                         <button onClick={() => setSelectedSpaceId(null)} className="btn secondary" style={{ marginBottom: '24px' }}>Back to Layouts</button>
                         <h2 style={{ fontSize: '28px', color: 'var(--text-primary)', marginBottom: '8px' }}>{currentSpace.name} Dashboard</h2>
                         <p style={{ color: 'var(--text-secondary)', fontSize: '13px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginTop: '12px' }}>
                            <span style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '4px 10px', borderRadius: '16px' }}>
                                Block: <strong>{currentSpace.parentResource ? currentSpace.parentResource.name : 'N/A'}</strong>
                            </span>
                            <span style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '4px 10px', borderRadius: '16px' }}>
                                Floor: <strong>{currentSpace.floor || 'N/A'}</strong>
                            </span>
                            <span style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '4px 10px', borderRadius: '16px' }}>
                                Location: <strong>{currentSpace.location || 'N/A'}</strong>
                            </span>
                            <span style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '4px 10px', borderRadius: '16px' }}>
                                Capacity: <strong>{currentSpace.capacity || 'N/A'}</strong>
                            </span>
                            {currentSpace.configType !== 'NONE' && (
                                <span style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '4px 10px', borderRadius: '16px' }}>
                                    <strong>{currentSpace.configType}</strong> Setup
                                </span>
                            )}
                         </p>

                         <hr style={{ margin: '24px 0', borderColor: 'var(--border-color)', borderStyle: 'solid' }} />

                         <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)' }}>Attached Tracking Assets</h3>
                         {currentSpace.subResources && currentSpace.subResources.length > 0 ? (
                             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
                                 {currentSpace.subResources.map(asset => (
                                     <div key={asset.id} style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px', background: 'var(--bg-secondary)' }}>
                                        <div style={{ fontSize: '12px', marginBottom: '8px', color: 'var(--text-secondary)', fontWeight: 700 }}>{asset.category === 'EQUIPMENT' ? 'EQUIPMENT' : 'UTILITY'}</div>
                                        <h4 style={{ margin: '0 0 4px 0', color: 'var(--text-primary)' }}>{asset.name}</h4>
                                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{asset.type.replace('_', ' ')}</span>
                                        {asset.capacity && <div style={{ fontSize: '12px', marginTop: '8px', fontWeight: 'bold' }}>Qty Count: {asset.capacity}</div>}
                                     </div>
                                 ))}
                             </div>
                         ) : (
                             <div className="empty-state card">No discrete equipment bindings located for this space.</div>
                         )}
                     </div>
                 );
            })() : displayedResources.length === 0 && (!selectedBuildingId || (selectedBuildingId && !selectedFaculty && faculties.length === 0)) ? (
                <div className="empty-state card">
                    <div className="empty-state-icon">No resources</div>
                    <h3>No resources found</h3>
                    <p>Try adjusting your search filters or add a new resource.</p>
                </div>
            ) : (
                <div className="ticket-grid">
                    {/* Intermediate Faculty Drill-down Overlay */}
                    {activeTab === 'infrastructure' && selectedBuildingId && !selectedFaculty && faculties.length > 0 && (
                        faculties.map(fac => (
                            <div key={fac} className="card ticket-card" 
                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', cursor: 'pointer', border: '2px solid transparent', transition: '0.2s', background: 'var(--bg-secondary)' }} 
                                onClick={() => setSelectedFaculty(fac)} 
                                onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary-color)'} 
                                onMouseOut={(e) => e.currentTarget.style.borderColor = 'transparent'}>
                                <div style={{ fontSize: '12px', marginBottom: '16px', color: 'var(--text-secondary)', fontWeight: 700 }}>FACULTY</div>
                                <h3 className="card-title" style={{ textAlign: 'center', margin: 0, fontSize: '18px' }}>{fac.replace('_', ' ')} FACULTY</h3>
                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px', textAlign: 'center' }}>Click to view academic spaces & assets</div>
                            </div>
                        ))
                    )}

                    {displayedResources.map((resource) => (
                        <div key={resource.id} className="card ticket-card" style={{ display: 'flex', flexDirection: 'column', cursor: (!selectedBuildingId && resource.category === 'BUILDING') || resource.category === 'SPACE' ? 'pointer' : 'default', border: '2px solid transparent', transition: 'border-color 0.2s' }} 
                            onClick={(e) => { 
                                // Prevent navigating if clicking an admin action button
                                if (e.target.tagName.toLowerCase() === 'button') return;
                                if (!selectedBuildingId && resource.category === 'BUILDING') setSelectedBuildingId(resource.id); 
                                else if (resource.category === 'SPACE') setSelectedSpaceId(resource.id);
                            }} 
                            onMouseOver={(e) => { if((!selectedBuildingId && resource.category === 'BUILDING') || resource.category === 'SPACE') e.currentTarget.style.borderColor = 'var(--primary-color)'; }} 
                            onMouseOut={(e) => { e.currentTarget.style.borderColor = 'transparent'; }}>
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
                            <div className="card-category" style={{marginBottom: '5px', fontSize: '12px', fontWeight: 'bold', color: 'var(--primary-color)'}}>
                                {resource.category} - {resource.type}
                            </div>
                            
                            {resource.faculties && resource.faculties.length > 0 && (
                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                    {resource.faculties.map(fac => <span key={fac} style={{ background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>{fac}</span>)}
                                </div>
                            )}
                            {resource.configType && resource.configType !== 'NONE' && (
                                <div style={{ fontSize: '12px', background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginBottom: '10px' }}>
                                    {resource.configType === 'FIXED' ? 'Fixed Setup' : 'Flexible Setup'}
                                </div>
                            )}
                            
                            <div className="ticket-meta" style={{ flexGrow: 1 }}>
                                <div className="ticket-meta-item">
                                    <strong>{['EQUIPMENT', 'UTILITY'].includes(resource.category) ? 'STORAGE' : 'LOCATION'}</strong>
                                    <span>{resource.location}</span>
                                </div>
                                <div className="ticket-meta-item">
                                    <strong>{['EQUIPMENT', 'UTILITY'].includes(resource.category) ? 'QTY' : 'CAPACITY'}</strong>
                                    <span>{resource.capacity || 'N/A'}</span>
                                </div>
                                {!['EQUIPMENT', 'UTILITY'].includes(resource.category) && (
                                    <div className="ticket-meta-item">
                                        <strong>AVAILABILITY</strong>
                                        <span>{resource.availableFrom} - {resource.availableTo}</span>
                                    </div>
                                )}
                            </div>
                            
                            <div className="card-actions" style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); navigate(`/bookings/new?resourceId=${resource.id}&resourceName=${encodeURIComponent(resource.name)}`); }} 
                                    className="btn primary" 
                                    style={{ flex: 1 }}>
                                    Book
                                </button>
                                {isStaff && (
                                    <>
                                        <button onClick={(e) => { e.stopPropagation(); navigate(`/resources/edit/${resource.id}`); }} className="btn secondary" style={{ flex: 1 }}>
                                            Edit
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); promptDelete(resource); }} className="btn danger" style={{ flex: 1 }}>
                                            Delete
                                        </button>
                                    </>
                                )}
                            </div>
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
