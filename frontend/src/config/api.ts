// src/config/api.ts
// OVH prod: https://christland.tech
// Local: http://127.0.0.1:8000

const host = window.location.hostname;

// Considère "local" si localhost / 127.0.0.1 / IP LAN
const isLocal =
  host === "localhost" ||
  host === "127.0.0.1" ||
  /^192\.168\./.test(host) ||
  /^10\./.test(host) ||
  /^172\.(1[6-9]|2\d|3[0-1])\./.test(host);

export const API_BASE = isLocal
  ? "http://127.0.0.1:8000/christland"
  : "https://christland.tech/christland";

export const MEDIA_BASE = isLocal
  ? "http://127.0.0.1:8000"
  : "https://christland.tech";

export function buildImageUrl(path?: string | null): string {
  if (!path) return "/images/placeholder.png";

  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  // Si path commence déjà par MEDIA_URL côté Django (ex: /media/xxx)
  if (!path.startsWith("/")) path = "/" + path;

  return `${MEDIA_BASE}${path}`;
}
