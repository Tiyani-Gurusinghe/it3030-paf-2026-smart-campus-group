import axios from 'axios';

// This pulls the URL from the .env file
const API_BASE_URL = import.meta.env.VITE_API_ORIGIN || 'http://localhost:8081';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default apiClient;