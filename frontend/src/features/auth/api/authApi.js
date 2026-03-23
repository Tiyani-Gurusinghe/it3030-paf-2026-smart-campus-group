import apiClient from "../../../services/apiClient";

export const authApi = {
  login: (payload) => apiClient.post("/auth/login", payload),
  getProfile: () => apiClient.get("/auth/me"),
};