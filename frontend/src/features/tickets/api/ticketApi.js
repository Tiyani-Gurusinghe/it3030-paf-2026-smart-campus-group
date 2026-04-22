// import apiClient from "../../services/apiClient";

/**
 * All paths here automatically use the Base URL from apiClient.js (port 8081).
 * We add /v1 to match your Spring Boot @RequestMapping("/api/v1/tickets").
 */

export const getAllTickets = (page = 0, size = 10) => 
    apiClient.get(`/v1/tickets?page=${page}&size=${size}`);

export const getTicket = (id) => 
    apiClient.get(`/v1/tickets/${id}`);

export const createTicket = (payload) => 
    apiClient.post("/v1/tickets", payload);

export const updateTicket = (id, payload) => 
    apiClient.put(`/v1/tickets/${id}`, payload);

export const deleteTicket = (id) => 
    apiClient.delete(`/v1/tickets/${id}`);

// Object export for compatibility with components using ticketApi.getAll()
export const ticketApi = {
  getAll: getAllTickets,
  getById: getTicket,
  create: createTicket,
  update: updateTicket,
  delete: deleteTicket
};