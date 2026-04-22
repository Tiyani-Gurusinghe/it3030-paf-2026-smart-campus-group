import apiClient from "../../services/apiClient";

export const bookingApi = {
  getAll: () => apiClient.get("/bookings"),
  getById: (id) => apiClient.get(`/bookings/${id}`),
  getByUserId: (userId) => apiClient.get(`/bookings/user/${userId}`),
  getByResourceId: (resourceId) => apiClient.get(`/bookings/resource/${resourceId}`),
  create: (payload) => apiClient.post("/bookings", payload),
  updateStatus: (id, status) => apiClient.patch(`/bookings/${id}/status?status=${status}`),
  delete: (id) => apiClient.delete(`/bookings/${id}`),
};