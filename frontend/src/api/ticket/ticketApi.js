const BASE_URL = "http://localhost:8080/api/v1/tickets";

function getHeaders(includeUserId = false) {
  const headers = { "Content-Type": "application/json" };
  if (includeUserId) {
    const userId = localStorage.getItem("userId");
    if (userId) headers["X-User-Id"] = userId;
  }
  return headers;
}

async function parseError(res) {
  let data = null;
  try { data = await res.json(); } catch { throw new Error("Something went wrong"); }
  if (data?.validationErrors) {
    const messages = Object.values(data.validationErrors).join(", ");
    throw new Error(messages);
  }
  throw new Error(data?.message || "Request failed");
}

// ─── Tickets ─────────────────────────────────────────────────

export async function getTickets(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status)     params.set("status",     filters.status);
  if (filters.priority)   params.set("priority",   filters.priority);
  if (filters.category)   params.set("category",   filters.category);
  if (filters.reportedBy) params.set("reportedBy", filters.reportedBy);
  const query = params.toString() ? `?${params}` : "";
  const res = await fetch(`${BASE_URL}${query}`);
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function getTicket(id) {
  const res = await fetch(`${BASE_URL}/${id}`);
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function createTicket(payload) {
  const userId = localStorage.getItem("userId");
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, reportedBy: userId ? Number(userId) : null }),
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function updateTicket(id, payload) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function updateTicketStatus(id, payload) {
  const res = await fetch(`${BASE_URL}/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function deleteTicket(id) {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) await parseError(res);
}

// ─── Comments ────────────────────────────────────────────────

export async function getComments(ticketId) {
  const res = await fetch(`${BASE_URL}/${ticketId}/comments`);
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function addComment(ticketId, content) {
  const res = await fetch(`${BASE_URL}/${ticketId}/comments`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify({ content }),
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function updateComment(ticketId, commentId, content) {
  const res = await fetch(`${BASE_URL}/${ticketId}/comments/${commentId}`, {
    method: "PUT",
    headers: getHeaders(true),
    body: JSON.stringify({ content }),
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function deleteComment(ticketId, commentId) {
  const res = await fetch(`${BASE_URL}/${ticketId}/comments/${commentId}`, {
    method: "DELETE",
    headers: getHeaders(true),
  });
  if (!res.ok) await parseError(res);
}

// ─── Attachments ─────────────────────────────────────────────

export async function getAttachments(ticketId) {
  const res = await fetch(`${BASE_URL}/${ticketId}/attachments`);
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function uploadAttachments(ticketId, files) {
  const formData = new FormData();
  files.forEach((f) => formData.append("files", f));
  const res = await fetch(`${BASE_URL}/${ticketId}/attachments`, {
    method: "POST",
    body: formData,
    // Do NOT set Content-Type — browser sets multipart boundary automatically
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function deleteAttachment(ticketId, attachmentId) {
  const res = await fetch(`${BASE_URL}/${ticketId}/attachments/${attachmentId}`, {
    method: "DELETE",
  });
  if (!res.ok) await parseError(res);
}
