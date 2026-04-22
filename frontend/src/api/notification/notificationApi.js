const BASE_URL = `${import.meta.env.VITE_API_ORIGIN || "http://localhost:8080"}/api/v1/notifications`;

async function parseError(res) {
  let data = null;
  try { data = await res.json(); } catch { throw new Error("Something went wrong"); }
  throw new Error(data?.message || "Request failed");
}

export async function getNotifications() {
  const userId = localStorage.getItem("userId");
  if (!userId) return [];
  const res = await fetch(`${BASE_URL}?userId=${userId}`);
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function getUnreadCount() {
  const userId = localStorage.getItem("userId");
  if (!userId) return 0;
  const res = await fetch(`${BASE_URL}/unread-count?userId=${userId}`);
  if (!res.ok) return 0;
  const data = await res.json();
  return data.unreadCount ?? 0;
}

export async function markAllRead() {
  const userId = localStorage.getItem("userId");
  if (!userId) return;
  await fetch(`${BASE_URL}/mark-read?userId=${userId}`, { method: "PATCH" });
}
