// src/hooks/useFetchQuery.ts
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type FetcherInit = RequestInit & { timeoutMs?: number };
type Options<T> = {
  /** Objet de querystring (ex: {page:1, brand:'canon,nikon'}) */
  params?: Record<string, unknown>;
  /** Liste de dépendances pour relancer la requête */
  deps?: any[];
  /** Conserver la data précédente pendant le refetch */
  keepPreviousData?: boolean;
  /** Attendre X ms avant de tirer la requête (utile quand on tape/filtre) */
  debounceMs?: number;
  /** Transformer la réponse avant setData */
  select?: (raw: any) => T;
  /** Options fetch */
  fetchInit?: FetcherInit;
};

type State<T> = { data: T | null; loading: boolean; error: string | null };

/* =========================================
   Helpers
========================================= */

/** Serialize proprement les params pour querystring */
const toQueryString = (params?: Record<string, unknown>) => {
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

/** Construit un header Accept JSON sans écraser les autres */
const withJsonAccept = (init?: RequestInit): RequestInit => {
  const headers = new Headers(init?.headers || {});
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  return { ...init, headers };
};

/** Décode intelligemment: tente JSON, sinon renvoie un extrait texte (utile pour pages HTML d’erreur) */
const parseJsonSafe = async (res: Response) => {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  // fallback texte (page HTML d’erreur Django, etc.)
  const text = await res.text();
  const snippet = text.replace(/\s+/g, " ").slice(0, 300);
  throw new Error(`HTTP ${res.status} — Réponse non-JSON: ${snippet}`);
};

/** Timeout manuel basé sur AbortController */
const fetchWithTimeout = async (input: RequestInfo | URL, init?: FetcherInit) => {
  const controller = new AbortController();
  const id = init?.timeoutMs
    ? setTimeout(() => controller.abort(), init.timeoutMs)
    : null;

  try {
    const res = await fetch(input, { ...init, signal: controller.signal });
    if (id) clearTimeout(id as any);
    return res;
  } catch (e) {
    if (id) clearTimeout(id as any);
    throw e;
  }
};

/* Cache mémoire simple par clé */
const memoryCache = new Map<string, any>();

/* =========================================
   Hook
========================================= */

export function useFetchQuery<T = any>(url: string, opts: Options<T> = {}) {
  const {
    params,
    deps = [],
    keepPreviousData = true,
    debounceMs = 0,
    select,
    fetchInit,
  } = opts;

  const key = useMemo(() => url + toQueryString(params), [url, params]);

  const [state, setState] = useState<State<T>>({
    data: (keepPreviousData && memoryCache.get(key)) || null,
    loading: !memoryCache.has(key),
    error: null,
  });

  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<number | null>(null);

  const run = useCallback(async () => {
    // Abort d’un éventuel fetch précédent
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    // Reset loading si pas de cache à garder
    if (!keepPreviousData || !memoryCache.has(key)) {
      setState((s) => ({ ...s, loading: true, error: null }));
    }

    const qs = toQueryString(params);
    const requestInit = withJsonAccept(fetchInit);

    try {
      const res = await fetchWithTimeout(url + qs, {
        ...requestInit,
        signal: ctrl.signal,
      });

      if (!res.ok) {
        // Essaie de lire du JSON, sinon lève une erreur texte (parseJsonSafe s’en occupe)
        await parseJsonSafe(res); // lève avec snippet si pas JSON
        throw new Error(`HTTP ${res.status}`); // fallback
      }

      const raw = await parseJsonSafe(res);
      const data = (select ? select(raw) : raw) as T;

      memoryCache.set(key, data);
      setState({ data, loading: false, error: null });
    } catch (e: any) {
      if (e?.name === "AbortError") return; // ignorer abort normal
      setState((s) => ({
        ...s,
        loading: false,
        error: e?.message ?? "Network error",
      }));
    }
  }, [key, url, params, keepPreviousData, select, fetchInit]);

  const refetch = useCallback(() => {
    memoryCache.delete(key);
    run();
  }, [key, run]);

  useEffect(() => {
    if (debounceMs > 0) {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(run, debounceMs);
    } else {
      run();
    }
    return () => {
      abortRef.current?.abort();
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, ...deps]);

  return { ...state, refetch };
}

/* =========================================
   Export helper si besoin ailleurs
========================================= */
export { toQueryString };


