import apiClient from '../../services/apiClient';

// We use the apiClient configured by your team leader (likely handles base URL and auth tokens)
const resourceApi = {
    // GET all resources (with optional filters)
    getAllResources: async (filters = {}) => {
        // Only add filters that actually have a value
        const validParams = {};
        if (filters.type) validParams.type = filters.type;
        if (filters.minCapacity) validParams.minCapacity = filters.minCapacity;
        if (filters.location) validParams.location = filters.location;
        
        // Axios will automatically handle the ? and formatting for us safely
        const response = await apiClient.get('/api/resources', { params: validParams });
        return response.data;
    },

    // GET a single resource by ID
    getResourceById: async (id) => {
        const response = await apiClient.get(`/api/resources/${id}`);
        return response.data;
    },

    // POST a new resource
    createResource: async (resourceData) => {
        const response = await apiClient.post('/api/resources', resourceData);
        return response.data;
    },

    // PUT to update a resource
    updateResource: async (id, resourceData) => {
        const response = await apiClient.put(`/api/resources/${id}`, resourceData);
        return response.data;
    },

    // DELETE a resource
    deleteResource: async (id) => {
        const response = await apiClient.delete(`/api/resources/${id}`);
        return response.data;
    }
};

export default resourceApi;