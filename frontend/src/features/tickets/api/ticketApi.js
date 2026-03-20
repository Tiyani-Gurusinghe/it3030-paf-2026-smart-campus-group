import apiClient from "../../../services/apiClient";

export const ticketApi = {
  getAll: () => apiClient.get("/tickets"),
  getById: (id) => apiClient.get(`/tickets/${id}`),
  create: (payload) => apiClient.post("/tickets", payload),
};