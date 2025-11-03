import { useState, useEffect } from "react";
import { Trash2, Plus, CheckCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getDashboardProducts,
  deleteDashboardProduct,
  getDashboardArticles,
  deleteDashboardArticle,
  type ApiArticle,
} from "../hooks/useFetchQuery";
import type { ApiProduct } from "../hooks/useFetchQuery";

const PAGE_SIZE = 24; // = SmallPagination.page_size

const ProductTable = () => {
  const [activeTab, setActiveTab] = useState<"produits" | "articles">("produits");
  const [page, setPage] = useState(1);

  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [articles, setArticles] = useState<ApiArticle[]>([]);

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

  // --- Mode NORMAL (sans q) : recharge par onglet + page
  useEffect(() => {
    if (searchMode) return; // en mode recherche, on laisse l’autre effet gérer
    if (activeTab === "produits") fetchProducts();
    else fetchArticles();
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
      } else {
        await deleteDashboardArticle(confirmId);
        setArticles((prev) => prev.filter((a) => a.id !== confirmId));
        setSuccessMsg("Article supprimé avec succès !");
      }

      // met à jour le compteur + recule d'une page si la page devient vide
      setCount((prev) => {
        const next = Math.max(0, prev - 1);
        const itemsLeftOnPage =
          (activeTab === "produits" ? products.length : articles.length) - 1;
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

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm w-full md:w-3/4 overflow-y-scroll h-[80vh] md:h-[50vh] lg:h-[65vh] relative">
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
      <div className="flex border-b mb-4">
        <button
          onClick={() => {
            setActiveTab("produits");
            setPage(1);
          }}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "produits"
              ? "text-[#00A9DC] border-b-2 border-[#00A9DC]"
              : "text-gray-500 hover:text-[#00A9DC]"
          }`}
        >
          Tous les Produits
        </button>
        <button
          onClick={() => {
            setActiveTab("articles");
            setPage(1);
          }}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "articles"
              ? "text-[#00A9DC] border-b-2 border-[#00A9DC]"
              : "text-gray-500 hover:text-[#00A9DC]"
          }`}
        >
          Tous les Articles
        </button>
      </div>

      {loading && <div className="text-center py-6">Chargement...</div>}
      {error && <div className="text-red-500 text-center py-6">{error}</div>}

      {/* --- Table --- */}
      {!loading && !error && (
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <table className="min-w-[600px] w-full text-sm text-left border-collapse">
            <thead className="text-gray-500 border-b">
              {activeTab === "produits" ? (
                <tr>
                  <th className="py-2 px-2 md:px-4">Image</th>
                  <th className="py-2 px-2 md:px-4">Nom</th>
                  <th className="py-2 px-2 md:px-4">Prix</th>
                  <th className="py-2 px-2 md:px-4">Quantité</th>
                  <th className="py-2 px-2 md:px-4">Modifier</th>
                  <th className="py-2 px-2 md:px-4">Supprimer</th>
                </tr>
              ) : (
                <tr>
                  <th className="py-2 px-2 md:px-4">Image</th>
                  <th className="py-2 px-2 md:px-4">Extrait</th>
                  <th className="py-2 px-2 md:px-4">Modifier</th>
                  <th className="py-2 px-2 md:px-4">Supprimer</th>
                </tr>
              )}
            </thead>

            <tbody>
              {activeTab === "produits" ? (
                products.length ? (
                  products.map((p) => (
                    <tr key={p.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-2 md:px-4">
                        <img
                          src={getImageSafe(p)}
                          alt={p.nom}
                          className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover my-1"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "/Dispositivos.webp";
                          }}
                        />
                      </td>
                      <td className="py-2 px-2 md:px-4 text-gray-700">{p.nom}</td>
                      <td className="py-2 px-2 md:px-4 text-gray-700">
                        {p.prix_from != null
                          ? `${Number(p.prix_from as any).toLocaleString("fr-FR")} FCFA`
                          : "—"}
                      </td>
                      <td className="py-2 px-2 md:px-4">
                        {p.variants_stock?.[0] ?? p.stock_total ?? p.quantite ?? "—"}
                      </td>
                      <td className="py-2 px-2 md:px-4">
                        <Plus
                          className="text-[#00A9DC] cursor-pointer"
                          size={18}
                          onClick={() => navigate(`/Dashboard/Modifier/${p.id}`)}
                        />
                      </td>
                      <td className="py-2 px-2 md:px-4">
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
                )
              ) : articles.length ? (
                articles.map((a) => (
                  <tr key={a.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-2 md:px-4">
                      <img
                        src={a.image || "/Dispositivos.webp"}
                        alt={a.titre}
                        className="w-12 h-12 rounded-lg object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "/Dispositivos.webp";
                        }}
                      />
                    </td>

                    <td className="py-2 px-2 md:px-4 text-gray-500 truncate max-w-[240px]">
                      {a.extrait || "—"}
                    </td>
                    <td className="py-2 px-2 md:px-4">
                      <Plus
                        className="text-[#00A9DC] cursor-pointer"
                        size={18}
                        onClick={() => navigate(`/Dashboard/Articles/${a.id}/edit`)}
                      />
                    </td>
                    <td className="py-2 px-2 md:px-4">
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
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {count > 0 && (
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
