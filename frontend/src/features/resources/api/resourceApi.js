import apiClient from "../../../services/apiClient";

export const resourceApi = {
  getAll: () => apiClient.get("/resources"),
  getById: (id) => apiClient.get(`/resources/${id}`),
  create: (payload) => apiClient.post("/resources", payload),
};