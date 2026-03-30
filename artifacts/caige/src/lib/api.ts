const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

async function apiFetch(path: string, options?: RequestInit) {
  const user = JSON.parse(localStorage.getItem("caige_user") || "null");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (user?.id) headers["x-user-id"] = String(user.id);

  const res = await fetch(`${BASE}/api${path}`, { ...options, headers: { ...headers, ...options?.headers } });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const api = {
  get: (path: string) => apiFetch(path),
  post: (path: string, body: unknown) => apiFetch(path, { method: "POST", body: JSON.stringify(body) }),
  put: (path: string, body: unknown) => apiFetch(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: (path: string) => apiFetch(path, { method: "DELETE" }),
};
