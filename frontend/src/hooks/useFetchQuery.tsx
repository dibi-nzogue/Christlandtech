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
export type ApiAttribute = { code: string; libelle: string; type: "text"|"int"|"dec"|"bool"|"choice"; options?: ApiAttributeOption[] | string[] };

export type FiltersPayload = {
  brands?: ApiBrand[];
  colors?: ApiColor[];
  states?: { value: string; label?: string }[];
  attributes?: ApiAttribute[];            // rétro-compat (si backend pas encore à jour)
  attributes_product?: ApiAttribute[];    // ✅ nouveau
  attributes_variant?: ApiAttribute[];    // ✅ nouveau
};

export type ApiProduct = {
  id: number;
  nom: string;
  slug: string;
  description_courte?: string;
  prix_from?: number | string | null;       // prix affiché (promo ou normal)
  old_price_from?: number | string | null;  // prix normal des variantes en promo
  marque?: { slug: string; nom: string } | null;
  categorie?: { slug: string; nom: string } | null;
  images?: ApiImage[];
   variants_stock?: (number | null)[];
  promo_now?: boolean;   
  quantite?: number | null;   // champ direct sur Produits
  stock_total?: number | null; // somme des v.stock (variantes) si tu l’exposes    
  promo_fin?: string | null;       // ✅ ajoute cette ligne
  promo_debut?: string | null;     // (optionnel mais utile)           // true si promo active maintenant
};


export type ApiPage<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};


// 🔎 Hook simple: recherche par nom
export function useProductSearchByName(q: string, opts?: {
  page?: number;
  page_size?: number;
  extra?: Record<string, any>; // ex: category, subcategory, sort...
}) {
  const page = opts?.page ?? 1;
  const page_size = opts?.page_size ?? 24;

  return useFetchQuery<ApiPage<ApiProduct>>(api("/catalog/products/"), {
    params: { q, page, page_size, ...(opts?.extra || {}) },
    enabled: q.trim().length >= 2,     // anti-spam si trop court
    keepPreviousData: true,
    debounceMs: 200,
  });
}

// ✅ Si tu as déjà useProducts(params), il suffit d’y passer { q }

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

export function useProducts(params: Record<string, any>) {
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


// ➕ tout en bas de useFetchQuery.tsx (ou dans la section "Fonctions API simples")

/** Enregistre un clic sur "Commander" pour un produit donné */
export async function recordProductClick(productId: number) {
  const url = api(`/api/catalog/products/${productId}/click/`);
  const res = await fetch(url, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
  });
  // On ne jette pas si 200 OK (l’API renvoie {ok,count})
  if (!res.ok) {
    // on ne bloque pas l’UX : on remonte une erreur “douce”
    try {
      const body = await res.json();
      throw new Error(body?.detail || `HTTP ${res.status}`);
    } catch {
      throw new Error(`HTTP ${res.status}`);
    }
  }
  return res.json(); // { ok: true, count: number }
}

// (optionnel mais pratique) – Hook pour "Les plus demandés"
export type MostDemandedProduct = {
  id: number;
  slug: string;
  nom: string;
  image?: string | null;
  price?: string | null;
  count: number;
};

export function useMostDemandedProducts(limit = 2) {
  return useFetchQuery<MostDemandedProduct[]>(
    api("/api/catalog/products/most-demanded/"),
    { params: { limit }, keepPreviousData: true }
  );
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




/* =========================================================
   🧭 ADMIN / DASHBOARD 
========================================================= */

export async function getDashboardProducts(params: Record<string, unknown> = {}) {
  const url = api("/api/dashboard/produits/") + toQueryString(params);
  const res = await fetch(url, withJsonAccept());
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await parseJsonSafe(res)) as ApiPage<ApiProduct>;
}



export async function createDashboardProduct(payload: Partial<ApiProduct>) {
  const url = api("/api/dashboard/produits/");
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await parseJsonSafe(res)) as ApiProduct;
}

export async function updateDashboardProduct(id: number, payload: Partial<ApiProduct>) {
  const url = api(`/api/dashboard/produits/${id}/`);
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await parseJsonSafe(res)) as ApiProduct;
}

export async function deleteDashboardProduct(id: number) {
  const url = api(`/api/dashboard/produits/${id}/`);
  const res = await fetch(url, { method: "DELETE" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return true;
}

export function useDashboardProducts(params: Record<string, unknown> = {}) {
  return useFetchQuery<ApiPage<ApiProduct>>(api("/api/dashboard/produits/"), {
    params,
    keepPreviousData: true,
    debounceMs: 100,
  });
}

export function useDashboardProduct(id?: number) {
  return useFetchQuery<ApiProduct>(
    id ? api(`/api/dashboard/produits/${id}/`) : "",
    { enabled: !!id }
  );
}

export async function getDashboardProduct(id: number) {
  // nouvelle route "edit" qui renvoie uniquement les champs REMPLIS
  const url = api(`/api/dashboard/produits/${id}/edit/`);
  const res = await fetch(url, withJsonAccept());
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await parseJsonSafe(res)) as any;
}

// hooks/useFetchQuery.tsx
export async function updateDashboardProductDeep(id: number, payload: any) {
  const url = api(`/api/dashboard/produits/${id}/edit/`);
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await parseJsonSafe(res);
  if (!res.ok) throw new Error(body?.detail || `HTTP ${res.status}`);
  return body;
}



export type ApiArticle = {
  id: number;
  titre: string;
  slug: string;
  extrait: string | null;
  contenu: string | null;
  image: string | null;     
  publie_le?: string | null;
  cree_le?: string | null;
  modifie_le?: string | null;
};

type PagedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export async function getDashboardArticles(params: { page?: number; page_size?: number; q?: string }): Promise<PagedResponse<ApiArticle>> {
  const page = params.page ?? 1;
  const page_size = params.page_size ?? 23;
  const q = params.q ? `&q=${encodeURIComponent(params.q)}` : "";

  // ✅ utilise la fonction api() pour inclure /christland/api/
  const res = await fetch(api(`/api/dashboard/articles/?page=${page}&page_size=${page_size}${q}`), {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function deleteDashboardArticle(id: number): Promise<void> {
  // ✅ même correction ici
  const res = await fetch(api(`/api/dashboard/articles/${id}/`), { method: "DELETE" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

/// --- Article: fetch one (EDIT payload réduit) ---
export async function getDashboardArticle(id: number): Promise<ApiArticle> {
  const res = await fetch(api(`/api/dashboard/articles/${id}/edit/`), {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as ApiArticle; // contiendra: id, titre, slug, extrait, contenu, image, publie_le
}

// --- Article: update (PUT sur la ressource) ---
export async function updateDashboardArticle(id: number, payload: Partial<ApiArticle>) {
  const res = await fetch(api(`/api/dashboard/articles/${id}/`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(body?.detail || `HTTP ${res.status}`);
  return body as ApiArticle;
}

// --- Derniers articles (2 par défaut)
export async function getLatestArticles(limit = 2) {
  const res = await fetch(
    api(`/api/dashboard/articles/?page=1&page_size=${limit}`),
    { headers: { Accept: "application/json" } }
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const body = await res.json();
  return (body?.results ?? []) as ApiArticle[];
}

// --- Derniers articles (2 par défaut)

export function useLatestArticles(limit = 2) {
  return useFetchQuery<ApiArticle[]>(api("/api/dashboard/articles/"), {
    params: { page: 1, page_size: limit },
    keepPreviousData: true,
    select: (raw: any) => (raw?.results ?? []) as ApiArticle[],
  });
}

// --- Créer un article ---
export type NewArticlePayload = {
  extrait?: string | null;
  contenu?: string | null;
  image?: string | null;        // URL (uploadée via uploadProductImage)
   // "YYYY-MM-DDTHH:mm" (optional)
};

export async function createDashboardArticle(payload: NewArticlePayload) {
  const res = await fetch(api("/api/dashboard/articles/"), {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(body?.detail || `HTTP ${res.status}`);
  return body;
}

// --- 2 derniers articles ---
export type LatestArticle = {
  id: number;
  title: string;
  excerpt: string;
  image?: string | null;
};

export function useblogLatestArticles(limit = 2) {
  return useFetchQuery<LatestArticle[]>(
    api("/api/blog/latest/"),
    { params: { limit }, keepPreviousData: true, debounceMs: 100 }
  );
}



/* =========================================================
   🛒 PRODUITS + VARIANTES (Formulaire d’ajout)
========================================================= */

// ...

export type ProductPayload = {
  nom: string;
  slug?: string;
  description_courte?: string;
  description_long?: string;
  garantie_mois?: number | null;
  poids_grammes?: number | null;
  est_actif?: boolean;
  visible?: number | null;
  dimensions?: string;
  etat?: "neuf" | "occasion" | "reconditionné";
  categorie?: number | string | null;
  marque?: number | string | null;
    product_attributes?: {
    code: string;
    type: "text" | "int" | "dec" | "bool" | "choice";
    libelle?: string;
    unite?: string;
    value: string;
  }[];

  variant_attributes?: {
    code: string;
    type: "text" | "int" | "dec" | "bool" | "choice";
    libelle?: string;
    unite?: string;
    value: string;
  }[];
  // Variante
  variante_nom?: string;
  sku?: string;
  code_barres?: string;
  prix?: number | null;
  prix_promo?: number | null;
  promo_active?: boolean;
  promo_debut?: string | null;         // ⬅️
  promo_fin?: string | null;           // ⬅️
  stock?: number | null;
  couleur?: number | string | null;
  prix_achat?: number | null;          // ⬅️
  variante_poids_grammes?: number | null; // ⬅️
  variante_est_actif?: boolean;        // ⬅️

  images?: { url: string; alt_text?: string; position?: number | null; principale?: boolean }[];
};

// src/hooks/useFetchQuery.tsx (remplace la fonction existante)
export async function createProductWithVariant(payload: ProductPayload & { images?: any[] }) {
  const url = api("/api/produits/ajouter/");
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });

  let body: any = null;
  try { body = await res.json(); } catch { body = null; }

  if (!res.ok) {
    // ⬇️ LOG utile en dev pour voir tout le JSON
    console.error("Create product error", res.status, body);

    // Compose un message lisible
    let msg = body?.error || body?.detail || `HTTP ${res.status}`;

    // Si l’API renvoie field/field_errors, on les concatène
    if (body?.field) {
      msg = `${body.field}: ${body?.error || body?.detail || "Erreur"}`;
    }
    if (body?.field_errors && typeof body.field_errors === "object") {
      const parts = Object.entries(body.field_errors).map(([k, v]) => `${k}: ${v}`);
      if (parts.length) msg += " — " + parts.join(" | ");
    }

    throw new Error(msg);
  }

  return body;
}



/* =========================================================
   📚 Référentiels : catégories, marques, couleurs
========================================================= */

/** Catégories */
export function useCategories() {
  return useFetchQuery<ApiCategory[]>(api("/api/catalog/categories/"), {
    keepPreviousData: true,
    select: (raw: any) => (Array.isArray(raw) ? raw : raw?.results ?? []),
  });
}

/** Marques */
export function useMarques() {
  return useFetchQuery<ApiBrand[]>(api("/api/catalog/marques/"), {
    keepPreviousData: true,
    select: (raw: any) => (Array.isArray(raw) ? raw : raw?.results ?? []),
  });
}

/** Couleurs */
export function useCouleurs() {
  return useFetchQuery<ApiColor[]>(api("/api/catalog/couleurs/"), {
    keepPreviousData: true,
    select: (raw: any) => (Array.isArray(raw) ? raw : raw?.results ?? []),
  });
}


export async function uploadProductImage(file: File, alt_text?: string) {
  const url = api("/api/uploads/images/");
  const fd = new FormData();
  fd.append("file", file);
  if (alt_text) fd.append("alt_text", alt_text);

  const res = await fetch(url, {
    method: "POST",
    body: fd,
  });
  if (!res.ok) {
    const raw = await res.json().catch(() => ({}));
    throw new Error(raw?.error || `HTTP ${res.status}`);
  }
  return (await res.json()) as { url: string; alt_text?: string };
}
// Types search
export type AdminSearchItem = {
  type: "product" | "article";
  id: number;
  title: string;
  excerpt?: string;
  image?: string | null;
  url: string;
  created_at?: string | null;
  updated_at?: string | null;
  brand?: string | null;
  category?: string | null;
};

export type AdminSearchPage = {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminSearchItem[];
};

// ✅ Appelle le bon endpoint: /api/dashboard/search/
export async function adminGlobalSearch(params: { q: string; page?: number; page_size?: number }) {
  const page = params.page ?? 1;
  const page_size = params.page_size ?? 10;
  const url = api("/api/dashboard/search/") + toQueryString({ q: params.q, page, page_size });
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as AdminSearchPage;
}

// ✅ Hook pratique (q + options)
export function useAdminGlobalSearch(
  q: string,
  opts?: { page?: number; page_size?: number }
) {
  const page = opts?.page ?? 1;
  const page_size = opts?.page_size ?? 10;
  return useFetchQuery<AdminSearchPage>(api("/api/dashboard/search/"), {
    params: { q, page, page_size },
    enabled: !!q.trim(),
    debounceMs: 200,
    keepPreviousData: true,
  });
}




// Types
export type DashboardStats = {
  users: number;
  products_stock: number; // somme des stocks (variantes)
  products: number;       // nombre de Produits (distincts)
  articles: number;
  messages: number;
};

// Fetch (one-shot)
export async function getDashboardStats(): Promise<DashboardStats> {
  const res = await fetch(api(`/api/dashboard/stats/`), {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as DashboardStats;
}

// Hook
export function useDashboardStats() {
  return useFetchQuery<DashboardStats>(api(`/api/dashboard/stats/`), {
    enabled: true,
    refetchOnWindowFocus: false,
    
  });
}
