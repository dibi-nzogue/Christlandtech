import { useState, useEffect } from "react";
import { Trash2, Plus, CheckCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import React from "react";
import { ChevronRight, ChevronDown } from "lucide-react";

import {
  getDashboardProducts,
  deleteDashboardProduct,
  getDashboardArticles,
  deleteDashboardArticle,
  getDashboardCategories, 
  deleteDashboardCategory

} from "../hooks/useFetchQuery";
import type { ApiProduct,ApiCategory,ApiArticle } from "../hooks/useFetchQuery";
type CategoryNode = ApiCategory & { children?: CategoryNode[] };



// juste après les imports
// Types des onglets
type TabType = "produits" | "articles" | "categories";

// Onglet initial en fonction de ?tab=...
const params = new URLSearchParams(window.location.search);
const tabParam = params.get("tab");
const initialTab: TabType =
  tabParam === "articles"
    ? "articles"
    : tabParam === "categories"
    ? "categories"
    : "produits";




const PAGE_SIZE = 24; // = SmallPagination.page_size

const ProductTable = () => {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  const [page, setPage] = useState(1);

  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [articles, setArticles] = useState<ApiArticle[]>([]);
const [categories, setCategories] = useState<CategoryNode[]>([]);


  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const navigate = useNavigate();

  // --- lecture du terme recherché depuis l'URL (marche après refresh)
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const q = (searchParams.get("q") || "").trim();

  // --- IMPORTANT: searchMode mis à jour quand q change
  const [searchMode, setSearchMode] = useState(q.length > 0);
  useEffect(() => {
    setSearchMode(q.length > 0);
  }, [q]);

  const getImageSafe = (product: ApiProduct): string =>
    product?.images?.[0]?.url && product.images[0].url !== "null"
      ? product.images[0].url
      : "/Dispositivos.webp";

  // === Fetchers ===
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDashboardProducts({ page, page_size: PAGE_SIZE });
      if (Array.isArray(data)) {
        setProducts(data);
        setCount(data.length);
      } else if (data?.results) {
        setProducts(data.results);
        setCount(data.count ?? data.results.length ?? 0);
      } else {
        setProducts([]);
        setCount(0);
      }
    } catch (e: any) {
      setError(e.message || "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  const fetchArticles = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDashboardArticles({ page, page_size: PAGE_SIZE });
      setArticles(data.results ?? []);
      setCount(data.count ?? data.results?.length ?? 0);
    } catch (e: any) {
      setError(e.message || "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

 const fetchCategories = async () => {
  setLoading(true);
  setError(null);
  try {
    // 👉 pour les catégories on charge tout d’un coup
    const data = await getDashboardCategories({
      page: 1,
      page_size: 500,   // ou 1000, selon ton volume
      q,
    });

    const flatRows =
      (data as any).results ??
      (data as any).items ??
      (Array.isArray(data) ? data : []) ??
      [];

    const treeRows = buildTree(flatRows);

    setCategories(treeRows);
    // compteur = nombre total de catégories, mais on n’utilisera pas la pagination pour elles
    setCount(flatRows.length ?? 0);
  } catch (e: any) {
    setError(e.message || "Erreur de chargement");
  } finally {
    setLoading(false);
  }
};


const [openParents, setOpenParents] = useState<number[]>([]);

const toggleParent = (id: number) => {
  setOpenParents((prev) =>
    prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
  );
};


// Transforme la liste plate (parent_id) en arbre { parent -> children[] }
const buildTree = (list: ApiCategory[]): CategoryNode[] => {
  const map: Record<number, CategoryNode> = {};

  // 1) on met toutes les catégories dans une map
  list.forEach((c) => {
    map[c.id] = { ...c, children: [] };
  });

  const tree: CategoryNode[] = [];

  // 2) on accroche les sous-catégories à leur parent
  list.forEach((c) => {
    if (c.parent_id && map[c.parent_id]) {
      map[c.parent_id].children!.push(map[c.id]);
    } else {
      // pas de parent_id -> catégorie racine
      tree.push(map[c.id]);
    }
  });

  return tree;
};


    // === Sync de l’onglet avec l’URL (quand tu navigues vers /Dashboard?tab=articles)
  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const tab = sp.get("tab");

    if (tab === "articles") {
      setActiveTab("articles");
    } else if (tab === "categories") {
      setActiveTab("categories");
    } else {
      setActiveTab("produits");
    }
  }, [location.search]);



// --- Mode NORMAL (sans q) : recharge par onglet + page
useEffect(() => {
  if (searchMode) return; // en mode recherche, on laisse l’autre effet gérer

  if (activeTab === "produits") {
    fetchProducts();
  } else if (activeTab === "articles") {
    fetchArticles();
  } else if (activeTab === "categories") {
    fetchCategories();
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [activeTab, page, searchMode]);


  // --- Mode RECHERCHE (avec q) : charge produits + articles, choisit l’onglet
  useEffect(() => {
    if (!searchMode) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [prodsData, artsData] = await Promise.all([
          getDashboardProducts({ page, page_size: PAGE_SIZE, q }),
          getDashboardArticles({ page, page_size: PAGE_SIZE, q }),
        ]);

        const prodsRows = Array.isArray(prodsData) ? prodsData : prodsData?.results ?? [];
        const artsRows = artsData?.results ?? [];

        setProducts(prodsRows);
        setArticles(artsRows);

        // Choix de l’onglet selon les résultats
        if (prodsRows.length > 0) {
          setActiveTab("produits");
          setCount((prodsData as any)?.count ?? prodsRows.length ?? 0);
        } else {
          setActiveTab("articles");
          setCount(artsData?.count ?? artsRows.length ?? 0);
        }
      } catch (e: any) {
        setError(e.message || "Erreur de recherche");
      } finally {
        setLoading(false);
      }
    })();
  }, [q, page, searchMode]);

  // --- Reset pagination quand q change
  useEffect(() => {
    setPage(1);
  }, [q]);

  // === Suppression ===
  const requestDelete = (id: number) => setConfirmId(id);

  const handleDeleteConfirmed = async () => {
    if (confirmId == null) return;
    setConfirmLoading(true);
    try {
      if (activeTab === "produits") {
        await deleteDashboardProduct(confirmId);
        setProducts((prev) => prev.filter((p) => p.id !== confirmId));
        setSuccessMsg("Produit supprimé avec succès !");
      } else if (activeTab === "articles") {
        await deleteDashboardArticle(confirmId);
        setArticles((prev) => prev.filter((a) => a.id !== confirmId));
        setSuccessMsg("Article supprimé avec succès !");
      } else {
        await deleteDashboardCategory(confirmId);
        setCategories((prev) => prev.filter((c) => c.id !== confirmId));
        setSuccessMsg("Catégorie supprimée avec succès !");
      }

      // met à jour le compteur + recule d'une page si la page devient vide
      setCount((prev) => {
        const next = Math.max(0, prev - 1);
        const itemsLeftOnPage =
          activeTab === "produits"
            ? products.length - 1
            : activeTab === "articles"
            ? articles.length - 1
            : categories.length - 1;

        if (itemsLeftOnPage === 0 && page > 1) {
          setPage(page - 1);
        }
        return next;
      });

      setTimeout(() => setSuccessMsg(null), 7000);
    } catch (e: any) {
      alert("Erreur lors de la suppression : " + (e?.message ?? "inconnue"));
    } finally {
      setConfirmLoading(false);
      setConfirmId(null);
    }
  };


  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  // Helper pour changer d’onglet + mettre à jour l’URL
  const goToTab = (tab: TabType) => {
    const sp = new URLSearchParams(location.search);
    sp.set("tab", tab);
    navigate(`${location.pathname}?${sp.toString()}`, { replace: true });
    setActiveTab(tab);
    setPage(1);
  };

const tabBaseCls =
  "px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm lg:text-base font-medium whitespace-nowrap";

  return (

    
   <div
  className="
    bg-white rounded-xl shadow-sm
    w-full md:w-3/4
    p-3 md:p-4
    h-auto md:h-[70vh] lg:h-[73vh]
    overflow-visible md:overflow-y-auto
    relative
  "
>
      {successMsg && (
        <div
          role="alert"
          className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-green-100 text-green-800 border border-green-300 px-5 py-3 rounded-lg shadow-lg"
        >
          <CheckCircle size={20} />
          <span className="text-base font-medium">{successMsg}</span>
        </div>
      )}

      {/* Onglets */}
    <div className="flex border-b mb-4 overflow-x-auto">
  <button
    onClick={() => goToTab("produits")}
    className={`${tabBaseCls} ${
      activeTab === "produits"
        ? "text-[#00A9DC] border-b-2 border-[#00A9DC]"
        : "text-gray-500 hover:text-[#00A9DC]"
    }`}
  >
    Tous les Produits
  </button>

  <button
    onClick={() => goToTab("articles")}
    className={`${tabBaseCls} ${
      activeTab === "articles"
        ? "text-[#00A9DC] border-b-2 border-[#00A9DC]"
        : "text-gray-500 hover:text-[#00A9DC]"
    }`}
  >
    Tous les Articles
  </button>

  <button
    onClick={() => goToTab("categories")}
    className={`${tabBaseCls} ${
      activeTab === "categories"
        ? "text-[#00A9DC] border-b-2 border-[#00A9DC]"
        : "text-gray-500 hover:text-[#00A9DC]"
    }`}
  >
    Toutes les Catégories
  </button>
</div>




      {loading && <div className="text-center py-6">Chargement...</div>}
      {error && <div className="text-red-500 text-center py-6">{error}</div>}

      {/* --- Table --- */}
      {!loading && !error && (
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <table className="min-w-[520px] w-full text-xs md:text-sm text-left border-collapse">
           <thead className="text-gray-500 border-b">
          {activeTab === "produits" && (
            <tr>
              <th className="py-1.5 md:py-2 px-2 md:px-4">Image</th>
              <th className="py-1.5 md:py-2 px-2 md:px-4">Nom</th>
              <th className="py-1.5 md:py-2 px-2 md:px-4">Prix</th>
              <th className="py-1.5 md:py-2 px-2 md:px-4">Quantité</th>
              <th className="py-1.5 md:py-2 px-2 md:px-4">Modifier</th>
              <th className="py-1.5 md:py-2 px-2 md:px-4">Supprimer</th>
            </tr>
          )}

          {activeTab === "articles" && (
            <tr>
              <th className="py-1.5 md:py-2 px-2 md:px-4">Image</th>
              <th className="py-1.5 md:py-2 px-2 md:px-4">Extrait</th>
              <th className="py-1.5 md:py-2 px-2 md:px-4">Modifier</th>
              <th className="py-1.5 md:py-2 px-2 md:px-4">Supprimer</th>
            </tr>
          )}

          {activeTab === "categories" && (
  <tr>
    <th className="py-1.5 md:py-2 px-2 md:px-4">Nom</th>
    <th className="py-1.5 md:py-2 px-2 md:px-4">Description</th>
    <th className="py-1.5 md:py-2 px-2 md:px-4">Statut</th>
    <th className="py-1.5 md:py-2 px-2 md:px-4">Modifier</th>
    <th className="py-1.5 md:py-2 px-2 md:px-4">Supprimer</th>
  </tr>
)}


        </thead>

<tbody>
  {/* PRODUITS */}
  {activeTab === "produits" &&
    (products.length ? (
      products.map((p) => (
        <tr key={p.id} className="border-b hover:bg-gray-50">
          <td className="py-1.5 md:py-2 px-2 md:px-4">
            <img
             width={300}
                      height={300}
              src={getImageSafe(p)}
              alt={p.nom}
              loading="lazy"
              className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover my-1"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/Dispositivos.webp";
              }}
            />
          </td>
          <td className="py-1.5 md:py-2 px-2 md:px-4 text-gray-700">{p.nom}</td>
          <td className="py-1.5 md:py-2 px-2 md:px-4 text-gray-700">
            {p.prix_from != null
              ? `${Number(p.prix_from as any).toLocaleString("fr-FR")} FCFA`
              : "—"}
          </td>
          <td className="py-1.5 md:py-2 px-2 md:px-4">
            {p.variants_stock?.[0] ?? p.stock_total ?? p.quantite ?? "—"}
          </td>
          <td className="py-1.5 md:py-2 px-2 md:px-4">
            <Plus
              className="text-[#00A9DC] cursor-pointer"
              size={18}
             onClick={() => navigate(`/dashboard/modifier/${p.id}`)}
            />
          </td>
          <td className="py-1.5 md:py-2 px-2 md:px-4">
            <Trash2
              className="text-red-500 cursor-pointer"
              size={18}
              onClick={() => requestDelete(p.id)}
            />
          </td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan={6} className="text-center py-6 text-gray-500">
          Aucun produit trouvé.
        </td>
      </tr>
    ))}

  {/* ARTICLES */}
  {activeTab === "articles" &&
    (articles.length ? (
      articles.map((a) => (
        <tr key={a.id} className="border-b hover:bg-gray-50">
          <td className="py-1.5 md:py-2 px-2 md:px-4">
            <img
            width={300}
                      height={300}
              src={a.image || "/Dispositivos.webp"}
              alt={a.titre}
              loading="lazy"
              className="w-12 h-12 rounded-lg object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/Dispositivos.webp";
              }}
            />
          </td>
          <td className="py-2 px-2 md:px-4 text-gray-500 truncate max-w-[240px]">
            {a.extrait || "—"}
          </td>
          <td className="py-1.5 md:py-2 px-2 md:px-4">
            <Plus
              className="text-[#00A9DC] cursor-pointer"
              size={18}
              onClick={() => navigate(`/dashboard/Articles/${a.id}/edit`)}
            />
          </td>
          <td className="py-1.5 md:py-2 px-2 md:px-4">
            <Trash2
              className="text-red-500 cursor-pointer"
              size={18}
              onClick={() => requestDelete(a.id)}
            />
          </td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan={5} className="text-center py-6 text-gray-500">
          Aucun article.
        </td>
      </tr>
    ))}

 {/* CATEGORIES */}
{activeTab === "categories" &&
  (categories.length ? (
    categories.map((parent) => (
      <React.Fragment key={parent.id}>
        {/* Ligne catégorie parente */}
        <tr className="bg-gray-50 font-semibold">
          <td className="py-2 px-2 md:px-4 flex items-center gap-2">
            <button
            onClick={() => toggleParent(parent.id)}
            className="p-1 text-gray-600 hover:text-black"
          >
            {openParents.includes(parent.id) ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>

            {parent.nom}
          </td>

          <td className="py-2 px-2 md:px-4 text-gray-500 truncate max-w-[240px]">
            {parent.description || "—"}
          </td>

          <td className="py-1.5 md:py-2 px-2 md:px-4">
            <span
              className={
                parent.est_actif
                  ? "inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700"
                  : "inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600"
              }
            >
              {parent.est_actif ? "Actif" : "Inactif"}
            </span>
          </td>

          <td className="py-1.5 md:py-2 px-2 md:px-4">
            <Plus
              className="text-[#00A9DC] cursor-pointer"
              size={18}
              onClick={() => navigate(`/dashboard/Categories/${parent.id}/edit`)}
            />

          </td>

          <td className="py-1.5 md:py-2 px-2 md:px-4">
            <Trash2
              className="text-red-500 cursor-pointer"
              size={18}
              onClick={() => requestDelete(parent.id)}
            />
          </td>
        </tr>

        {/* Sous-catégories, seulement si le parent est ouvert */}
        {openParents.includes(parent.id) &&
          (parent.children ?? []).map((child) => (
            <tr key={child.id} className="border-b">
              <td className="py-2 px-8 md:px-10 text-gray-700">
                ↳ {child.nom}
              </td>

              <td className="py-2 px-2 md:px-4 text-gray-500 truncate max-w-[240px]">
                {child.description || "—"}
              </td>

              <td className="py-1.5 md:py-2 px-2 md:px-4">
                <span
                  className={
                    child.est_actif
                      ? "inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700"
                      : "inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600"
                  }
                >
                  {child.est_actif ? "Actif" : "Inactif"}
                </span>
              </td>

              <td className="py-1.5 md:py-2 px-2 md:px-4">
               <Plus
                className="text-[#00A9DC] cursor-pointer"
                size={18}
                onClick={() => navigate(`/dashboard/Categories/${child.id}/edit`)}
              />

              </td>

              <td className="py-1.5 md:py-2 px-2 md:px-4">
                <Trash2
                  className="text-red-500 cursor-pointer"
                  size={18}
                  onClick={() => requestDelete(child.id)}
                />
              </td>
            </tr>
          ))}
      </React.Fragment>
    ))
  ) : (
    <tr>
      <td colSpan={5} className="text-center py-6 text-gray-500">
        Aucune catégorie.
      </td>
    </tr>
  ))}


</tbody>
 </table>
        </div>
      )}


      {/* Pagination */}
      {count > 0 && activeTab !== "categories" && (
  <div className="flex justify-center mt-4">
    <div className="flex gap-2 flex-wrap">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          onClick={() => setPage(n)}
          className={`px-3 py-1 border rounded-full text-sm ${
            n === page ? "bg-[#00A9DC] text-white" : "bg-white hover:bg-blue-100"
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  </div>
)}


      {/* Modal confirmation */}
      {confirmId !== null && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/40 z-50"
          onClick={() => (confirmLoading ? null : setConfirmId(null))}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-md relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900">Confirmation</h3>
            <p className="mt-2 text-sm text-gray-600">
              Voulez-vous vraiment supprimer cet{" "}
              {activeTab === "produits" ? "produit" : "article"} ?
              <br />
              {activeTab === "produits" && (
                <span className="text-red-600 font-semibold">
                  Cette action supprimera aussi les variantes, images et spécifications liées.
                </span>
              )}
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded-xl border text-gray-700 hover:bg-gray-100"
                onClick={() => setConfirmId(null)}
                disabled={confirmLoading}
              >
                Annuler
              </button>
              <button
                className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                onClick={handleDeleteConfirmed}
                disabled={confirmLoading}
              >
                {confirmLoading ? "Suppression..." : "Oui, supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductTable;
