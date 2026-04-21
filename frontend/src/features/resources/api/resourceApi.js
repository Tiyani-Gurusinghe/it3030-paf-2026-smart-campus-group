import apiClient from '../../services/apiClient';

// We use the apiClient configured by your team leader (likely handles base URL and auth tokens)
const resourceApi = {
    // GET all resources (with optional filters)
    getAllResources: async (filters = {}) => {
        // Only add filters that actually have a value
        const validParams = {};
        if (filters.category && filters.category.trim() !== '') validParams.category = filters.category;
        if (filters.type && filters.type.trim() !== '') validParams.type = filters.type;
        if (filters.faculty && filters.faculty.trim() !== '') validParams.faculty = filters.faculty;
        if (filters.floor && filters.floor.trim() !== '') validParams.floor = filters.floor;
        if (filters.minCapacity) validParams.minCapacity = filters.minCapacity;
        if (filters.location && filters.location.trim() !== '') validParams.location = filters.location;
        
        // Axios will automatically handle the ? and formatting for us safely
        const response = await apiClient.get('/api/resources', { params: validParams });
        return response.data;
    },

    // GET a single resource by ID
    getResourceById: async (id) => {
        const response = await apiClient.get(`/api/resources/${id}`);
        return response.data;
    },

    // GET faculties in a building
    getFacultiesByBuilding: async (buildingId) => {
        const response = await apiClient.get(`/api/resources/building/${buildingId}/faculties`);
        return response.data;
    },

    // GET floors related to a faculty
    getFloorsByFaculty: async (faculty) => {
        const response = await apiClient.get(`/api/resources/faculty/${faculty}/floors`);
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