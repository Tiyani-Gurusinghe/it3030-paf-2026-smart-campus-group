import apiClient from "../../../services/apiClient";

export const notificationApi = {
  getAll: () => apiClient.get("/notifications"),
  markAsRead: (id) => apiClient.patch(`/notifications/${id}/read`),
};