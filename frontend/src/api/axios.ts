// src/api/axios.ts
import axios from "axios";
import { getUiLang } from "../i18nLang";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const lang = getUiLang(); // "fr" | "en"

  if (!config.headers) {
    config.headers = {} as any;
  }

  // ✅ On garde seulement ça
  (config.headers as any)["Accept-Language"] = lang;

  // ❌ NE PLUS METTRE ÇA :
  // (config.headers as any)["X-Lang"] = lang;

  return config;
});

export default api;
