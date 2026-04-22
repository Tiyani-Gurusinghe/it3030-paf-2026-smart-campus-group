import apiClient from "../../../services/apiClient";

export const bookingApi = {
  getAll: () => apiClient.get("/bookings"),
  getById: (id) => apiClient.get(`/bookings/${id}`),
  create: (payload) => apiClient.post("/bookings", payload),
};