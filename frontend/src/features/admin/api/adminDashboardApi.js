import apiClient from "../../services/apiClient";

export async function getAdminDashboardSummary() {
  const response = await apiClient.get("/api/admin/dashboard");
  return response.data?.data || response.data;
}
