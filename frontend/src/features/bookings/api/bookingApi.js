import apiClient from "../../services/apiClient";

export const bookingApi = {
  getAll: () => apiClient.get("/api/bookings"),
  getById: (id) => apiClient.get(`/api/bookings/${id}`),
  getByUserId: (userId) => apiClient.get(`/api/bookings/user/${userId}`),
  getByResourceId: (resourceId) => apiClient.get(`/api/bookings/resource/${resourceId}`),
  getAvailableQuantity: (resourceId, params) => apiClient.get(`/api/bookings/resource/${resourceId}/available-quantity`, { params }),
  create: (payload) => apiClient.post("/api/bookings", payload),
  update: (id, payload) => apiClient.put(`/api/bookings/${id}`, payload),
  updateStatus: (id, status) => apiClient.patch(`/api/bookings/${id}/status?status=${status}`),
  delete: (id) => apiClient.delete(`/api/bookings/${id}`),
};
