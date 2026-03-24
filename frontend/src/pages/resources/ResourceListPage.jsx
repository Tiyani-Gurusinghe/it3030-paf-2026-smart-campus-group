import React, { useState, useEffect } from 'react';
import resourceApi from '../../features/resources/api/resourceApi';

const ResourceListPage = () => {
    // State variables to hold our data and UI status
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // This runs automatically when the page loads
    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            setLoading(true);
            // Calling the API function we wrote earlier!
            const data = await resourceApi.getAllResources();
            setResources(data);
            setError(null);
        } catch (err) {
            setError('Failed to load resources. Make sure your Spring Boot backend is running!');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // What to show while waiting for the backend
    if (loading) return <div style={{ padding: '20px', fontSize: '18px' }}>Loading catalogue...</div>;
    
    // What to show if the backend is down
    if (error) return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;

    // The main UI
    return (
        <div style={{ padding: '30px', fontFamily: 'sans-serif' }}>
            <h2 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
                Facilities & Assets Catalogue
            </h2>
            
            {resources.length === 0 ? (
                <p>No resources found in the database.</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
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