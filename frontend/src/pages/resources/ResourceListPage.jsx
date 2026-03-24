import React, { useState, useEffect } from 'react';
import resourceApi from '../../features/resources/api/resourceApi';
import { useNavigate } from 'react-router-dom';

const ResourceListPage = () => {
    const navigate = useNavigate();
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // State to hold user's search inputs
    const [filters, setFilters] = useState({
        type: '',
        location: '',
        minCapacity: ''
    });

    useEffect(() => {
        fetchResources();
    }, []); // Initial load

    // Fetch resources, passing the current filters
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

    // Handle typing in the filter boxes
    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        });
    };

    // Trigger search when "Search" is clicked
    const handleSearch = (e) => {
        e.preventDefault();
        fetchResources();
    };

    // Clear filters
    const clearFilters = () => {
        setFilters({ type: '', location: '', minCapacity: '' });
        // We need to fetch immediately without filters, but state updates are async, 
        // so we pass an empty object directly to the API
        resourceApi.getAllResources({}).then(setResources).catch(console.error);
    };

    if (loading && resources.length === 0) return <div style={{ padding: '20px', fontSize: '18px' }}>Loading catalogue...</div>;
    if (error) return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;

    return (
        <div style={{ padding: '30px', fontFamily: 'sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>
                <h2 style={{ margin: 0 }}>Facilities & Assets Catalogue</h2>
                <button onClick={() => navigate('/resources/new')} style={{ padding: '10px 20px', backgroundColor: '#0056b3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                   + Add New Resource
                </button>
            </div>

            {/* Filter Section */}
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '15px', marginBottom: '20px', backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
                <select name="type" value={filters.type} onChange={handleFilterChange} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                    <option value="">All Types</option>
                    <option value="LECTURE_HALL">Lecture Hall</option>
                    <option value="LAB">Lab</option>
                    <option value="MEETING_ROOM">Meeting Room</option>
                    <option value="EQUIPMENT">Equipment</option>
                </select>

                <input 
                    type="text" 
                    name="location" 
                    placeholder="Search Location..." 
                    value={filters.location} 
                    onChange={handleFilterChange} 
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />

                <input 
                    type="number" 
                    name="minCapacity" 
                    placeholder="Min Capacity..." 
                    value={filters.minCapacity} 
                    onChange={handleFilterChange} 
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '120px' }}
                />

                <button type="submit" style={{ padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Search</button>
                <button type="button" onClick={clearFilters} style={{ padding: '8px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Clear</button>
            </form>
            
            {/* Table Section */}
            {resources.length === 0 ? (
                <p>No resources match your search.</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f4f4f9', textAlign: 'left' }}>
                            <th style={{ padding: '15px', borderBottom: '2px solid #ddd' }}>Name</th>
                            <th style={{ padding: '15px', borderBottom: '2px solid #ddd' }}>Type</th>
                            <th style={{ padding: '15px', borderBottom: '2px solid #ddd' }}>Location</th>
                            <th style={{ padding: '15px', borderBottom: '2px solid #ddd' }}>Capacity</th>
                            <th style={{ padding: '15px', borderBottom: '2px solid #ddd' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {resources.map((resource) => (
                            <tr key={resource.id} style={{ borderBottom: '1px solid #ddd', backgroundColor: '#fff' }}>
                                <td style={{ padding: '15px' }}><strong>{resource.name}</strong></td>
                                <td style={{ padding: '15px' }}>{resource.type.replace('_', ' ')}</td>
                                <td style={{ padding: '15px' }}>{resource.location}</td>
                                <td style={{ padding: '15px' }}>{resource.capacity || 'N/A'}</td>
                                <td style={{ padding: '15px' }}>
                                    <span style={{
                                        padding: '6px 12px',
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        backgroundColor: resource.status === 'ACTIVE' ? '#d4edda' : '#f8d7da',
                                        color: resource.status === 'ACTIVE' ? '#155724' : '#721c24'
                                    }}>
                                        {resource.status.replace('_', ' ')}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ResourceListPage;