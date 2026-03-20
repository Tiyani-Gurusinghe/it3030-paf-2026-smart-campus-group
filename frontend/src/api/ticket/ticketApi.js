const BASE_URL = "http://localhost:8080/api/v1/tickets";

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

  throw new Error(data?.message || "Request failed");
}

export async function getTickets() {
  const res = await fetch(BASE_URL);
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function getTicket(id) {
  const res = await fetch(`${BASE_URL}/${id}`);
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function createTicket(payload) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
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
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) await parseError(res);
}