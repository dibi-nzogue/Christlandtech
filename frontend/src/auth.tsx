// auth.ts
const ACCESS_KEY = "auth_access";
const REFRESH_KEY = "auth_refresh";
const USER_KEY = "auth_user";

export type Me = { id: number; email: string; prenom?: string; nom?: string; role?: string };

function parseJwt<T = any>(token: string): T | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64).split("").map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")
    );
    return JSON.parse(jsonPayload) as T;
  } catch {
    return null;
  }
}

function isExpired(token: string | null): boolean {
  if (!token) return true;
  const payload = parseJwt<{ exp?: number }>(token);
  if (!payload?.exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return payload.exp <= now;
}

export const auth = {
  get access(): string | null {
    return localStorage.getItem(ACCESS_KEY);
  },
  set access(t: string | null) {
    t ? localStorage.setItem(ACCESS_KEY, t) : localStorage.removeItem(ACCESS_KEY);
  },

  get refresh(): string | null {
    return localStorage.getItem(REFRESH_KEY);
  },
  set refresh(t: string | null) {
    t ? localStorage.setItem(REFRESH_KEY, t) : localStorage.removeItem(REFRESH_KEY);
  },

  get user(): Me | null {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || "null");
    } catch {
      return null;
    }
  },
  set user(u: Me | null) {
    u ? localStorage.setItem(USER_KEY, JSON.stringify(u)) : localStorage.removeItem(USER_KEY);
  },

  login(access: string, refresh: string, user: Me) {
    this.access = access;
    this.refresh = refresh;
    this.user = user;
  },

  isLoggedIn(): boolean {
    return !!this.access && !isExpired(this.access);
  },

  // ✅ n'ajoute le header que si le token est VALIDE
  bearerHeader(): Record<string, string> {
    const t = this.access;
    return t && !isExpired(t) ? { Authorization: `Bearer ${t}` } : {};
  },

  logout() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = "/dashboard/Connexion"; // ✅ minuscule
  },
};
