// apiFetch.ts
import { auth } from "./auth";

const API_BASE = "/christland"; // adapte si différent

async function refreshAccess(): Promise<boolean> {
  const r = auth.refresh;
  if (!r) return false;
  try {
    const res = await fetch(`${API_BASE}/api/dashboard/auth/refresh/`, {
      method: "POST",
      headers: { "Accept": "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: r }),
    });
    if (!res.ok) return false;
    const body = await res.json();
    if (!body?.access) return false;
    auth.access = body.access;
    return true;
  } catch {
    return false;
  }
}

export async function apiFetch(input: RequestInfo, init: RequestInit = {}, retry = true): Promise<Response> {
  const headers = new Headers(init.headers || {});
  const bearer = auth.bearerHeader();
  if (bearer.Authorization) headers.set("Authorization", bearer.Authorization);
  headers.set("Accept", headers.get("Accept") || "application/json");

  let res = await fetch(input, { ...init, headers });

  if (res.status === 401 && retry) {
    const ok = await refreshAccess();
    if (ok) {
      const headers2 = new Headers(init.headers || {});
      const bearer2 = auth.bearerHeader();
      if (bearer2.Authorization) headers2.set("Authorization", bearer2.Authorization);
      headers2.set("Accept", headers2.get("Accept") || "application/json");
      res = await fetch(input, { ...init, headers: headers2 });
    }
  }
  return res;
}
