// src/hooks/useFetchQuery.tsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/* =========================================================
   🔌 API helper SANS connexion (pas de token/interceptor)
========================================================= */
const API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000";
const API_PREFIX = import.meta.env.VITE_API_PREFIX ?? "/christland";
export const api = (p: string) => `${API_BASE}${API_PREFIX}${p}`;

/* =========================================================
   Types API
========================================================= */
export type ApiImage = {
  url: string;
  alt_text?: string;
  position?: number;
  principale?: boolean;
  slug?: string;
};

export type ApiCategory = {
  id: number;
  nom: string;
  slug: string;
  parent?: number | null;
  image_url?: string;
  position?: number;
};

export type ApiBrand = { slug: string; nom: string };
export type ApiColor = { slug: string; nom: string; code_hex?: string };
export type ApiAttributeOption = { slug: string; valeur: string };
export type ApiAttribute = { code: string; libelle: string; options: ApiAttributeOption[] };

export type FiltersPayload = {
  brands?: ApiBrand[];
  colors?: ApiColor[];
  attributes?: ApiAttribute[];
  states?: { value: string; label?: string }[];
};

export type ApiProduct = {
  id: number;
  nom: string;
  slug: string;
  description_courte?: string;
  prix_reference_avant?: number | null;
  marque?: { slug: string; nom: string } | null;
  categorie?: { slug: string; nom: string } | null;
  images?: ApiImage[];
};

export type ApiPage<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

/* =========================================================
   Hook générique useFetchQuery (+ refreshMs, focus/online refetch)
========================================================= */
type FetcherInit = RequestInit & { timeoutMs?: number };

export type UseFetchOptions<T> = {
  /** Querystring (ex: {page:1, brand:'canon'}) */
  params?: Record<string, unknown>;
  /** Dépendances supplémentaires pour relancer */
  deps?: any[];
  /** Conserver data précédente pendant refetch */
  keepPreviousData?: boolean;
  /** Délai avant fetch (utile pour inputs/filters) */
  debounceMs?: number;
  /** Transformer la réponse avant setData */
  select?: (raw: any) => T;
  /** Options fetch */
  fetchInit?: FetcherInit;
  /** Ne pas fetch si false (ex: enabled=!!slug) */
  enabled?: boolean;
  /** Callbacks */
  onSuccess?: (data: T) => void;
  onError?: (message: string) => void;

  /** ⏱ re-fetch automatique toutes les X ms (ex: 30000) */
  refreshMs?: number;
  /** 🔁 Refetch quand l’onglet revient au premier plan (par défaut: true) */
  refetchOnWindowFocus?: boolean;
  /** 🌐 Refetch quand on repasse en ligne (par défaut: true) */
  refetchOnReconnect?: boolean;
};

type State<T> = { data: T | null; loading: boolean; error: string | null };

export const toQueryString = (params?: Record<string, unknown>) => {
  if (!params) return "";
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0)) return;
    if (Array.isArray(v)) sp.set(k, v.join(","));
    else sp.set(k, String(v));
  });
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
};

const withJsonAccept = (init?: RequestInit): RequestInit => {
  const headers = new Headers(init?.headers || {});
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  return { ...init, headers };
};

const parseJsonSafe = async (res: Response) => {
  if (res.status === 204) return null;
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  const text = await res.text();
  const snippet = text.replace(/\s+/g, " ").slice(0, 300);
  throw new Error(`HTTP ${res.status} — Réponse non-JSON: ${snippet}`);
};

const fetchWithTimeout = async (input: RequestInfo | URL, init?: FetcherInit) => {
  const controller = new AbortController();
  const id = init?.timeoutMs ? setTimeout(() => controller.abort(), init.timeoutMs) : null;
  try {
    const res = await fetch(input, { ...init, signal: controller.signal });
    if (id) clearTimeout(id as any);
    return res;
  } catch (e) {
    if (id) clearTimeout(id as any);
    throw e;
  }
};

/** Cache mémoire simple */
const memoryCache = new Map<string, any>();

export function useFetchQuery<T = any>(url: string, opts: UseFetchOptions<T> = {}) {
  const {
    params,
    deps = [],
    keepPreviousData = true,
    debounceMs = 0,
    select,
    fetchInit,
    enabled = true,
    onSuccess,
    onError,
    refreshMs,
    refetchOnWindowFocus = true,
    refetchOnReconnect = true,
  } = opts;

  const key = useMemo(() => url + toQueryString(params), [url, params]);

  const [state, setState] = useState<State<T>>({
    data: (keepPreviousData && memoryCache.get(key)) || null,
    loading: enabled ? !memoryCache.has(key) : false,
    error: null,
  });

  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  const run = useCallback(async () => {
    if (!enabled || !url) return;

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    if (!keepPreviousData || !memoryCache.has(key)) {
      setState((s) => ({ ...s, loading: true, error: null }));
    }

    const qs = toQueryString(params);
    const requestInit = withJsonAccept(fetchInit);

    try {
      const res = await fetchWithTimeout(url + qs, { ...requestInit, signal: ctrl.signal });
      if (!res.ok) {
        await parseJsonSafe(res); // lève avec snippet si pas JSON
        throw new Error(`HTTP ${res.status}`);
      }
      const raw = await parseJsonSafe(res);
      const data = (select ? select(raw) : raw) as T;

      memoryCache.set(key, data);
      setState({ data, loading: false, error: null });
      onSuccess?.(data);
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      const msg = e?.message ?? "Network error";
      setState((s) => ({ ...s, loading: false, error: msg }));
      onError?.(msg);
    }
  }, [enabled, key, url, params, keepPreviousData, select, fetchInit, onSuccess, onError]);

  const refetch = useCallback(() => {
    memoryCache.delete(key);
    run();
  }, [key, run]);

  useEffect(() => {
    if (!enabled || !url) {
      abortRef.current?.abort();
      if (timerRef.current) window.clearTimeout(timerRef.current);
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      setState((s) => ({ ...s, loading: false }));
      return;
    }

    // premier fetch (debounce éventuel)
    if (debounceMs > 0) {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(run, debounceMs);
    } else {
      run();
    }

    // 🔁 re-fetch périodique
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    if (refreshMs && refreshMs > 0) {
      intervalRef.current = window.setInterval(() => {
        run(); // garde data précédente, évite le flash
      }, refreshMs);
    }

    // ♻️ refetch au retour de focus / reconnection
    const onVisibility = () => {
      if (refetchOnWindowFocus && document.visibilityState === "visible") run();
    };
    const onOnline = () => {
      if (refetchOnReconnect && navigator.onLine) run();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("online", onOnline);

    return () => {
      abortRef.current?.abort();
      if (timerRef.current) window.clearTimeout(timerRef.current);
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("online", onOnline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled, url, refreshMs, refetchOnWindowFocus, refetchOnReconnect, ...deps]);

  return { ...state, refetch };
}

/* =========================================================
   Fonctions API simples (pas de token)
========================================================= */
export async function getTopCategories(params: { level?: number } = {}) {
  const url = api("/api/catalog/categories/") + toQueryString(params);
  const res = await fetch(url, withJsonAccept());
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const raw = await parseJsonSafe(res);
  return Array.isArray(raw) ? (raw as ApiCategory[]) : (raw?.results ?? []);
}

export async function getFilters(params: { category?: string; subcategory?: string }) {
  const url = api("/api/catalog/filters/") + toQueryString(params);
  const res = await fetch(url, withJsonAccept());
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await parseJsonSafe(res)) as FiltersPayload;
}

export async function getProducts(params: Record<string, unknown>) {
  const url = api("/api/catalog/products/") + toQueryString(params);
  const res = await fetch(url, withJsonAccept());
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await parseJsonSafe(res)) as ApiPage<ApiProduct>;
}

/* =========================================================
   Hooks “clé en main” pour tes composants
========================================================= */
export function useTopCategories(params: { level?: number } = {}) {
  return useFetchQuery<ApiCategory[]>(api("/api/catalog/categories/"), {
    params,
    keepPreviousData: true,
    select: (raw: any) => (Array.isArray(raw) ? raw : raw?.results ?? []),
  });
}

export function useFilters(params: { category?: string; subcategory?: string }) {
  return useFetchQuery<FiltersPayload>(api("/api/catalog/filters/"), {
    params,
    keepPreviousData: true,
    debounceMs: 120,
  });
}

export function useProducts(params: Record<string, unknown>) {
  return useFetchQuery<ApiPage<ApiProduct>>(api("/api/catalog/products/"), {
    params,
    keepPreviousData: true,
    debounceMs: 120,
  });
}

// --- Blog: types ---
export type BlogHero = { title: string; slug: string };
export type BlogPost = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image?: string | null;
};
export type BlogPostsPayload = { top: BlogPost[]; bottom: BlogPost[] };

// --- Blog: hooks ---
export function useBlogHero() {
  return useFetchQuery<BlogHero>(api("/api/blog/hero/"), { keepPreviousData: true });
}
export function useBlogPosts() {
  return useFetchQuery<BlogPostsPayload>(api("/api/blog/posts/"), { keepPreviousData: true });
}

/* =========================================================
   Nouveautés (les 10 derniers produits)
========================================================= */
export type LatestProduct = {
  id: number;
  slug: string;
  name: string;
  brand?: { slug?: string | null; nom?: string | null } | null;
  image?: string | null;
  specs?: string;
  price?: string | null; // Decimal string
  state?: string | null;
  // 👇 ajout pour corriger ton erreur
  category?: { id?: number; nom?: string; slug?: string } | null;
  categorie?: { id?: number; nom?: string; slug?: string } | null;
};


export function useLatestProducts(opts?: {
  refreshMs?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnReconnect?: boolean;
}) {
  return useFetchQuery<LatestProduct[]>(api("/api/catalog/products/latest/"), {
    keepPreviousData: true,
    refreshMs: opts?.refreshMs ?? 30000, // 30s par défaut
    refetchOnWindowFocus: opts?.refetchOnWindowFocus ?? true,
    refetchOnReconnect: opts?.refetchOnReconnect ?? true,
  });
}
// --- Contact: types ---
export type ContactPayload = {
  nom: string;
  email: string;
  telephone?: string;
  sujet: string;
  message: string;
};

export type ContactMessage = {
  id: number;
  nom: string;
  email: string;
  telephone?: string;
  sujet: string;
  message: string;
  cree_le: string;
};

// --- Contact: API helpers ---
export async function sendContactMessage(payload: ContactPayload) {
  const res = await fetch(api("/api/contact/messages/"), {
    method: "POST",
    headers: { "Accept": "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const raw = await res.json().catch(() => ({}));
    const msg = raw?.detail || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return parseJsonSafe(res);
}

export function useContactMessages(limit = 50) {
  return useFetchQuery<ContactMessage[]>(
    api("/api/contact/messages/"),
    { params: { limit }, keepPreviousData: true }
  );
}

