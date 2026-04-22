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

    const [labEquipment, setLabEquipment] = useState({
        pcCount: '', pcId: null,
        smartBoardCount: '', smartBoardId: null
    });

    const [formData, setFormData] = useState({
        name: '',
        category: 'SPACE',
        type: 'LECTURE_HALL',
        parentResourceId: '',
        capacity: '', 
        location: '',
        availableFrom: '08:00:00',
        availableTo: '17:00:00',
        status: 'ACTIVE',
        status: 'ACTIVE',
        faculties: [],
        floor: '',
        configType: 'NONE'
    });

    const [parentOptions, setParentOptions] = useState([]);
    const [standaloneInventory, setStandaloneInventory] = useState([]);
    const [selectedInventoryIds, setSelectedInventoryIds] = useState([]);

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
        if (formData.category === 'SPACE' && formData.configType === 'FLEXIBLE') {
            const fetchInventory = async () => {
                try {
                    const eqs = await resourceApi.getAllResources({ category: 'EQUIPMENT' });
                    const uts = await resourceApi.getAllResources({ category: 'UTILITY' });
                    // All standalone + actively attached to THIS resource if editing
                    let allInv = [...eqs, ...uts].filter(r => !r.parentResource || (id && r.parentResource.id == id));
                    
                    // Specific Space Type Constraints (User requested isolating specific hardware!)
                    if (formData.type === 'LAB') {
                        allInv = allInv.filter(r => r.type === 'PC' || r.type === 'SMART_BOARD' || r.category === 'UTILITY'); 
                    } else if (formData.type === 'LECTURE_HALL' || formData.type === 'MEETING_ROOM') {
                        allInv = allInv.filter(r => ['TABLE', 'CHAIR', 'PROJECTOR', 'CAMERA', 'WHITE_BOARD', 'SCREEN'].includes(r.type) || r.category === 'UTILITY');
                    }
                    
                    setStandaloneInventory(allInv);
                    
                    if (id) {
                         const attached = allInv.filter(r => r.parentResource && r.parentResource.id == id).map(r => r.id);
                         setSelectedInventoryIds(attached);
                    }
                } catch (e) {
                    console.error("Failed to fetch inventory", e);
                }
            };
            fetchInventory();
        } else {
            setStandaloneInventory([]);
            setSelectedInventoryIds([]);
        }
    }, [formData.category, formData.configType, id]);

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
                        location: data.location || '',
                        availableFrom: data.availableFrom || '',
                        availableTo: data.availableTo || '',
                        status: data.status,
                        faculties: data.faculties || [],
                        floor: data.floor || '',
                        configType: data.configType || 'NONE'
                    });

                    // Reverse engineer dynamically generated lab equipment based on strict naming convention!
                    if (data.type === 'LAB' && data.subResources) {
                         let pC = '', pId = null;
                         let sC = '', sId = null;
                         const pcObj = data.subResources.find(r => r.type === 'PC' && r.name === `${data.name} PCs`);
                         if (pcObj) { pC = pcObj.capacity; pId = pcObj.id; }
                         
                         const sbObj = data.subResources.find(r => r.type === 'SMART_BOARD' && r.name === `${data.name} Smart Board`);
                         if (sbObj) { sC = sbObj.capacity; sId = sbObj.id; }
                         
                         setLabEquipment({ pcCount: pC, pcId: pId, smartBoardCount: sC, smartBoardId: sId });
                    }
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

    const handleInventoryToggle = (invId) => {
        setSelectedInventoryIds(prev => 
            prev.includes(invId) ? prev.filter(i => i !== invId) : [...prev, invId]
        );
    };

    const handleFacultyToggle = (fac) => {
        setFormData(prev => {
            const currentFaculties = prev.faculties || [];
            if (currentFaculties.includes(fac)) {
                return { ...prev, faculties: currentFaculties.filter(f => f !== fac) };
            } else {
                return { ...prev, faculties: [...currentFaculties, fac] };
            }
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            
            // Auto-select the first valid type when category changes
            if (name === 'category') {
                if (value === 'BUILDING') newData.type = 'ACADEMIC';
                else if (value === 'SPACE') newData.type = 'LECTURE_HALL';
                else if (value === 'EQUIPMENT') newData.type = 'PC';
                else if (value === 'UTILITY') newData.type = 'ELECTRICITY';
            }
            
            return newData;
        });

        // Clear specific validation error if exists
        if (validationErrors[name]) {
            setValidationErrors(prev => ({...prev, [name]: null}));
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

            let savedResource;
            if (id) {
                savedResource = await resourceApi.updateResource(id, payload);
            } else {
                savedResource = await resourceApi.createResource(payload);
            }

            // Sync flexible inventory
            if (formData.category === 'SPACE' && formData.configType === 'FLEXIBLE') {
                const spaceId = savedResource.id;

                for (let inv of standaloneInventory) {
                    const wasAttached = inv.parentResource && inv.parentResource.id == spaceId;
                    const isSelected = selectedInventoryIds.includes(inv.id);

                    if (isSelected && !wasAttached) {
                        // Attach
                        await resourceApi.updateResource(inv.id, { ...inv, parentResource: { id: spaceId } });
                    } else if (!isSelected && wasAttached) {
                        // Detach
                        await resourceApi.updateResource(inv.id, { ...inv, parentResource: null });
                    }
                }
            }
            
            // Dynamic Explicit Lab Inventory Generation
            if (formData.category === 'SPACE' && formData.type === 'LAB') {
                const spaceId = savedResource.id;
                
                // Process PCs
                if (labEquipment.pcCount && parseInt(labEquipment.pcCount) > 0) {
                     const pcPayload = {
                          name: `${formData.name} PCs`,
                          category: 'EQUIPMENT',
                          type: 'PC',
                          capacity: parseInt(labEquipment.pcCount),
                          status: 'ACTIVE',
                          location: formData.location || 'Inside Lab',
                          configType: 'NONE',
                          parentResource: { id: spaceId }
                     };
                     if (labEquipment.pcId) await resourceApi.updateResource(labEquipment.pcId, pcPayload);
                     else await resourceApi.createResource(pcPayload);
                } else if (labEquipment.pcId && (!labEquipment.pcCount || parseInt(labEquipment.pcCount) === 0)) {
                     await resourceApi.deleteResource(labEquipment.pcId);
                }

                // Process Smart Boards
                if (labEquipment.smartBoardCount && parseInt(labEquipment.smartBoardCount) > 0) {
                     const sbPayload = {
                          name: `${formData.name} Smart Board`,
                          category: 'EQUIPMENT',
                          type: 'SMART_BOARD',
                          capacity: parseInt(labEquipment.smartBoardCount),
                          status: 'ACTIVE',
                          location: formData.location || 'Inside Lab',
                          configType: 'NONE',
                          parentResource: { id: spaceId }
                     };
                     if (labEquipment.smartBoardId) await resourceApi.updateResource(labEquipment.smartBoardId, sbPayload);
                     else await resourceApi.createResource(sbPayload);
                } else if (labEquipment.smartBoardId && (!labEquipment.smartBoardCount || parseInt(labEquipment.smartBoardCount) === 0)) {
                     await resourceApi.deleteResource(labEquipment.smartBoardId);
                }
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
                                    <option value="PC">PC / Workstation</option>
                                    <option value="SMART_BOARD">Smart Board</option>
                                    <option value="TABLE">Table</option>
                                    <option value="CHAIR">Chair</option>
                                    <option value="PROJECTOR">Projector</option>
                                    <option value="CAMERA">Camera</option>
                                    <option value="WHITE_BOARD">White Board</option>
                                    <option value="SCREEN">Screen</option>
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

                    {(formData.category === 'SPACE' || formData.category === 'BUILDING') && (
                        <div className="form-field full-width">
                            <label>Assigned Faculties</label>
                            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                                {[
                                    {val: 'COMPUTING', label: 'Computing'},
                                    {val: 'BUSINESS', label: 'Business'},
                                    {val: 'ENGINEERING', label: 'Engineering'},
                                    {val: 'HUMANITIES_AND_SCIENCES', label: 'Humanities and Sciences'},
                                    {val: 'ARCHITECTURE', label: 'Architecture'},
                                    {val: 'GRADUATE_STUDIES', label: 'Graduate Studies'},
                                    {val: 'INTERNATIONAL_PROGRAMMES', label: 'International Programmes'},
                                    {val: 'GENERAL', label: 'General Scope'}
                                ].map(fac => (
                                    <label key={fac.val} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'normal', fontSize: '14px' }}>
                                        <input 
                                            type="checkbox"
                                            checked={formData.faculties.includes(fac.val)}
                                            onChange={() => handleFacultyToggle(fac.val)}
                                        />
                                        {fac.label}
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {formData.category === 'SPACE' && (
                        <div className="form-field">
                            <label>Floor Designation</label>
                            <input 
                                type="text" 
                                name="floor" 
                                value={formData.floor} 
                                onChange={handleChange}
                                placeholder="e.g. Floor 1, Ground Level"
                            />
                        </div>
                    )}

                    {formData.category === 'SPACE' && formData.type === 'LAB' && (
                         <div className="form-field full-width" style={{ padding: '16px', background: 'rgba(52, 152, 219, 0.1)', borderRadius: '8px', borderLeft: '4px solid var(--primary-color)' }}>
                             <label style={{ color: 'var(--primary-color)' }}>Lab Hardware Generation</label>
                             <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
                                 <div style={{flex: 1}}>
                                     <label style={{ fontSize: '13px', fontWeight: 'normal' }}>Total PCs Assigned</label>
                                     <input 
                                         type="number" 
                                         value={labEquipment.pcCount} 
                                         onChange={(e) => setLabEquipment({...labEquipment, pcCount: e.target.value})} 
                                         placeholder="e.g. 60"
                                     />
                                 </div>
                                 <div style={{flex: 1}}>
                                     <label style={{ fontSize: '13px', fontWeight: 'normal' }}>Total Smart Boards Assigned</label>
                                     <input 
                                         type="number" 
                                         value={labEquipment.smartBoardCount} 
                                         onChange={(e) => setLabEquipment({...labEquipment, smartBoardCount: e.target.value})} 
                                         placeholder="e.g. 2"
                                     />
                                 </div>
                             </div>
                             <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                                 <i>Entering values here will automatically build and map discrete Equipment instances dynamically specifically to this Lab to display gracefully on its Dashboard!</i>
                             </div>
                         </div>
                    )}

                    {formData.category === 'SPACE' && (
                        <div className="form-field full-width">
                            <label>Space Equipment Configuration *</label>
                            <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'normal' }}>
                                    <input 
                                        type="radio" 
                                        name="configType" 
                                        value="FIXED" 
                                        checked={formData.configType === 'FIXED'} 
                                        onChange={handleChange} 
                                    />
                                    🔒 Fixed (Ready-to-use, cannot attach extra assets)
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'normal' }}>
                                    <input 
                                        type="radio" 
                                        name="configType" 
                                        value="FLEXIBLE" 
                                        checked={formData.configType === 'FLEXIBLE'} 
                                        onChange={handleChange} 
                                    />
                                    ⚙️ Flexible (Supports assigning additional inventory)
                                </label>
                            </div>
                            
                            {formData.configType === 'FLEXIBLE' && standaloneInventory.length > 0 && (
                                <div style={{ marginTop: '16px', background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px' }}>
                                    <div style={{ marginBottom: '8px', fontSize: '13px', fontWeight: 'bold' }}>Assign Standalone Assets:</div>
                                    <div style={{ maxHeight: '150px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {standaloneInventory.map(inv => (
                                            <label key={inv.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 'normal' }}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedInventoryIds.includes(inv.id)}
                                                    onChange={() => handleInventoryToggle(inv.id)}
                                                />
                                                {inv.name} ({inv.type}) {inv.parentResource && <span style={{fontSize: '11px', color:'var(--primary-color)'}}>- Currently Attached</span>}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
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
                        <input required type="time" step="1" name="availableFrom" value={formData.availableFrom || ''} onChange={handleChange} />
                    </div>
                    <div className="form-field">
                        <label>Available To</label>
                        <input required type="time" step="1" name="availableTo" value={formData.availableTo || ''} onChange={handleChange} />
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