import apiClient from "../../services/apiClient";

// Individual exports (This fixes the "not provide an export named" error)
export const getAllTickets = () => apiClient.get("/tickets");
export const getTicket = (id) => apiClient.get(`/tickets/${id}`);
export const createTicket = (payload) => apiClient.post("/tickets", payload);
export const updateTicket = (id, payload) => apiClient.put(`/tickets/${id}`, payload);
export const deleteTicket = (id) => apiClient.delete(`/tickets/${id}`);

// Also keeping the object export so you don't break other files
export const ticketApi = {
  getAll: getAllTickets,
  getById: getTicket,
  create: createTicket,
  update: updateTicket,
  delete: deleteTicket
};