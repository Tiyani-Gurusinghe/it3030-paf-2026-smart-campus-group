const BASE = import.meta.env.VITE_API_ORIGIN || "http://localhost:8081";
const TICKET_BASE = `${BASE}/api/v1/tickets`;
const TECH_BASE = `${BASE}/api/technician/tickets`;
const ADMIN_BASE = `${BASE}/api/admin/tickets`;

// ─── Headers ──────────────────────────────────────────────────────────────────

function getUserId() {
  return localStorage.getItem("userId");
}

function getHeaders(extra = {}) {
  const userId = getUserId();
  const headers = { "Content-Type": "application/json" };
  if (userId) headers["X-User-Id"] = userId;
  return { ...headers, ...extra };
}

// ─── Error Handling ───────────────────────────────────────────────────────────

async function parseError(res) {
  let data = null;
  try {
    data = await res.json();
  } catch {
    throw new Error("Something went wrong");
  }
  if (data?.validationErrors) {
    const messages = Object.values(data.validationErrors).join(", ");
    throw new Error(messages);
  }
  throw new Error(data?.message || `Request failed (${res.status})`);
}

async function handleResponse(res) {
  if (!res.ok) await parseError(res);
  // 204 No Content
  if (res.status === 204) return null;
  return res.json();
}

// ─── Ticket APIs ──────────────────────────────────────────────────────────────

/**
 * Get all tickets (ADMIN).
 * Filters: { status, priority, reportedBy, page, size }
 */
export async function getAllTickets(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.priority) params.set("priority", filters.priority);
  if (filters.reportedBy) params.set("reportedBy", String(filters.reportedBy));
  params.set("page", String(filters.page ?? 0));
  params.set("size", String(filters.size ?? 10));
  const res = await fetch(`${TICKET_BASE}?${params}`, {
    headers: getHeaders(),
  });
  return handleResponse(res);
}

/**
 * Create a new ticket (USER).
 * reportedBy is injected from localStorage userId.
 */
export async function createTicket(payload) {
  const userId = getUserId();
  const res = await fetch(TICKET_BASE, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      ...payload,
      reportedBy: userId ? Number(userId) : null,
    }),
  });
  return handleResponse(res);
}

/**
 * Update an existing ticket (USER).
 * Backend expects the full TicketRequest shape.
 */
export async function updateTicket(id, payload) {
  const res = await fetch(`${TICKET_BASE}/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

/**
 * Get current user's own tickets (USER).
 * Filters: { status, page, size }
 */
export async function getMyTickets(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  params.set("page", String(filters.page ?? 0));
  params.set("size", String(filters.size ?? 10));
  const res = await fetch(`${TICKET_BASE}/my?${params}`, {
    headers: getHeaders(),
  });
  return handleResponse(res);
}

export async function getSkillsForResource(resourceId) {
  const params = new URLSearchParams({ resourceId: String(resourceId) });
  const res = await fetch(`${TICKET_BASE}/skills?${params}`, {
    headers: getHeaders(),
  });
  return handleResponse(res);
}

/**
 * Get single ticket by ID (visible to the requesting user).
 */
export async function getTicketById(id) {
  const res = await fetch(`${TICKET_BASE}/${id}`, {
    headers: getHeaders(),
  });
  return handleResponse(res);
}

/**
 * Update ticket status (TECHNICIAN / ADMIN).
 * payload: { status, resolutionNotes? }
 */
export async function updateTicketStatus(id, payload) {
  const res = await fetch(`${TICKET_BASE}/${id}/status`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

/**
 * Update resolution notes only (TECHNICIAN).
 * payload: { resolutionNotes }
 */
export async function updateTicketResolution(id, payload) {
  const res = await fetch(`${TICKET_BASE}/${id}/resolution`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

// ─── Technician APIs ──────────────────────────────────────────────────────────

/**
 * Get tickets assigned to the authenticated technician.
 * filters: { status?, overdue?, dueSoon?, page, size }
 */
export async function getTechnicianTickets(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.overdue) params.set("overdue", "true");
  if (filters.dueSoon) params.set("dueSoon", "true");
  params.set("page", String(filters.page ?? 0));
  params.set("size", String(filters.size ?? 10));
  const res = await fetch(`${TECH_BASE}?${params}`, {
    headers: getHeaders(),
  });
  return handleResponse(res);
}

// ─── Admin APIs ───────────────────────────────────────────────────────────────

/**
 * Assign / reassign technician (ADMIN).
 * payload: { assignedTo: userId }
 */
export async function assignTicket(id, payload) {
  const res = await fetch(`${ADMIN_BASE}/${id}/assign`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

/**
 * Reject a ticket (ADMIN).
 * payload: { rejectedReason }
 */
export async function rejectTicket(id, payload) {
  const res = await fetch(`${ADMIN_BASE}/${id}/reject`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

/**
 * Close a resolved ticket (ADMIN).
 */
export async function closeTicket(id) {
  const res = await fetch(`${ADMIN_BASE}/${id}/close`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify({}),
  });
  return handleResponse(res);
}

export async function getAssignableTechnicians(ticketId) {
  const res = await fetch(`${ADMIN_BASE}/${ticketId}/technicians`, {
    headers: getHeaders(),
  });
  return handleResponse(res);
}

export async function deleteTicket(id) {
  const res = await fetch(`${TICKET_BASE}/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return handleResponse(res);
}

// ─── Comments ─────────────────────────────────────────────────────────────────

export async function getComments(ticketId) {
  const res = await fetch(`${TICKET_BASE}/${ticketId}/comments`, {
    headers: getHeaders(),
  });
  return handleResponse(res);
}

export async function addComment(ticketId, content) {
  const res = await fetch(`${TICKET_BASE}/${ticketId}/comments`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ content }),
  });
  return handleResponse(res);
}

export async function updateComment(ticketId, commentId, content) {
  const res = await fetch(
    `${TICKET_BASE}/${ticketId}/comments/${commentId}`,
    {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ content }),
    }
  );
  return handleResponse(res);
}

export async function deleteComment(ticketId, commentId) {
  const res = await fetch(
    `${TICKET_BASE}/${ticketId}/comments/${commentId}`,
    {
      method: "DELETE",
      headers: getHeaders(),
    }
  );
  return handleResponse(res);
}

// ─── Attachments ──────────────────────────────────────────────────────────────

export async function getAttachments(ticketId) {
  const res = await fetch(`${TICKET_BASE}/${ticketId}/attachments`, {
    headers: getHeaders(),
  });
  return handleResponse(res);
}

export async function uploadAttachments(ticketId, files) {
  const formData = new FormData();
  files.forEach((f) => formData.append("files", f));
  const userId = getUserId();
  const headers = {};
  if (userId) headers["X-User-Id"] = userId;
  const res = await fetch(`${TICKET_BASE}/${ticketId}/attachments`, {
    method: "POST",
    headers, // No Content-Type: let browser set multipart boundary
    body: formData,
  });
  return handleResponse(res);
}

export async function deleteAttachment(ticketId, url) {
  const params = new URLSearchParams({ url });
  const res = await fetch(`${TICKET_BASE}/${ticketId}/attachments?${params}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return handleResponse(res);
}

// ─── Legacy aliases (kept for backward compat during migration) ───────────────
export const getTicket = getTicketById;
export const getTickets = getAllTickets;
