import apiClient from "../../services/apiClient";

export const authApi = {
  login: async (payload) => {
    const response = await apiClient.post("/api/v1/auth/login", payload);
    return response.data;
  },
  signup: async (payload) => {
    const response = await apiClient.post("/api/v1/auth/signup", payload);
    return response.data;
  },
  getProfile: async () => {
    const response = await apiClient.get("/api/v1/auth/me");
    return response.data;
  },
};
