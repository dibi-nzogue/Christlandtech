// src/config/api.ts
const isProd = window.location.hostname !== "localhost";

export const API_BASE = isProd
  ? "https://christlandtech.onrender.com/christland"
  : "http://127.0.0.1:8000/christland";

export const MEDIA_BASE = isProd
  ? "https://christlandtech.onrender.com"
  : "http://127.0.0.1:8000";

export function buildImageUrl(path?: string | null): string {
  if (!path) {
    // image de placeholder
    return "/images/placeholder.png";
  }
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path; // on ne touche pas
  }
  if (!path.startsWith("/")) {
    path = "/" + path;
  }
  return `${MEDIA_BASE}${path}`;
}
