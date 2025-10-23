import { useState, useEffect } from "react";
import { Trash2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getDashboardProducts, deleteDashboardProduct } from "../hooks/useFetchQuery";
import type { ApiProduct } from "../hooks/useFetchQuery";

const ProductTable = () => {
  const [activeTab, setActiveTab] = useState<"produits" | "articles">("produits");
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const fetchProducts = async () => {
  try {
    setLoading(true);
    setError(null);

    const data = await getDashboardProducts({ page });

    if (Array.isArray(data)) {
      setProducts(data);
      setCount(data.length);
    } else if (data.results) {
      setProducts(data.results);
      setCount(data.count ?? data.results.length);
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


  useEffect(() => {
    fetchProducts();
  }, [page]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Supprimer ce produit ?")) return;
    try {
      await deleteDashboardProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setCount(prev => prev - 1);
    } catch (e: any) {
      alert("Erreur lors de la suppression : " + e.message);
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm w-full md:w-3/4 overflow-y-scroll h-[80vh] md:h-[50vh] lg:h-[65vh]">
      {/* --- Onglets --- */}
      <div className="flex border-b mb-4">
        <button
          onClick={() => setActiveTab("produits")}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "produits"
              ? "text-[#00A9DC] border-b-2 border-[#00A9DC]"
              : "text-gray-500 hover:text-[#00A9DC]"
          }`}
        >
          Tous les Produits
        </button>
        <button
          onClick={() => setActiveTab("articles")}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "articles"
              ? "text-[#00A9DC] border-b-2 border-[#00A9DC]"
              : "text-gray-500 hover:text-[#00A9DC]"
          }`}
        >
          Tous les Articles
        </button>
      </div>

      {/* --- Table --- */}
      {loading && <div className="text-center py-6">Chargement...</div>}
      {error && <div className="text-red-500 text-center py-6">{error}</div>}

      {!loading && !error && (
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <table className="min-w-[600px] w-full text-sm text-left border-collapse">
            <thead className="text-gray-500 border-b">
              <tr>
                <th className="py-2 px-2 md:px-4">Image</th>
                <th className="py-2 px-2 md:px-4">Nom</th>
                <th className="py-2 px-2 md:px-4">Prix</th>
                <th className="py-2 px-2 md:px-4">Quantité</th>
                <th className="py-2 px-2 md:px-4">Modifier</th>
                <th className="py-2 px-2 md:px-4">Supprimer</th>
              </tr>
            </thead>

            <tbody>
              {products.length > 0 ? (
                products.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="py-2 px-2 md:px-4">
                      <img
                        src={p.images?.[0]?.url || "/placeholder.webp"}
                        alt={p.nom}
                        className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover my-1"
                      />
                    </td>
                    <td className="py-2 px-2 md:px-4 text-gray-700">{p.nom}</td>
                    <td className="py-2 px-2 md:px-4 text-gray-700">
                      {p.prix_reference_avant
                        ? `${p.prix_reference_avant.toLocaleString()} FCFA`
                        : "—"}
                    </td>
                    <td className="py-2 px-2 md:px-4">{p.quantite}</td>
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
                        onClick={() => handleDelete(p.id)}
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
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* --- Pagination --- */}
      {count > 0 && (
        <div className="flex justify-center mt-4">
          <div className="flex gap-2 flex-wrap">
            {Array.from({ length: Math.ceil(count / 23) }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`px-3 py-1 border rounded-full text-sm ${
                  n === page
                    ? "bg-[#00A9DC] text-white"
                    : "bg-white hover:bg-blue-100"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductTable;
