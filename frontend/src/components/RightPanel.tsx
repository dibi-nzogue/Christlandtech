import React from "react";
import { useNavigate } from "react-router-dom";
import { useMostDemandedProducts } from "../hooks/useFetchQuery";

const FALLBACK = "/Dispositivos.webp";

const RightPanel: React.FC = () => {
  const navigate = useNavigate();
  const { data: items, loading } = useMostDemandedProducts(2);

  return (
    <aside className="w-full lg:w-1/4 mt-6 lg:mt-0 lg:self-start">
      <div className="space-y-4">
        {/* Boutons */}
        <button
          onClick={() => navigate("/dashboard/Ajouter_produit")}
          className="w-full bg-[#00A9DC] hover:bg-sky-600 text-white py-2 rounded-xl shadow text-sm"
        >
          Ajouter un produit
        </button>
        <button
          onClick={() => navigate("/dashboard/Ajouter_article")}
          className="w-full bg-[#00A9DC] hover:bg-sky-600 text-white py-2 rounded-xl shadow text-sm"
        >
          Ajouter un article
        </button>
        <button
          onClick={() => navigate("/dashboard/Ajouter_categorie")}
          className="w-full bg-[#00A9DC] hover:bg-sky-600 text-white py-2 rounded-xl shadow text-sm"
        >
          Ajouter une catégorie
        </button>

        {/* Carte "Les plus demandés" */}
        <div className="bg-white p-3 rounded-xl shadow-sm mt-2 max-h-[65vh] overflow-y-auto">
          <h3 className="font-semibold mb-2 text-sm">Les Plus Demandés</h3>

          {loading && (
            <div className="text-xs text-gray-500">Chargement…</div>
          )}

          {!loading && (!items || items.length === 0) && (
            <div className="text-xs text-gray-500">
              Aucune donnée pour le moment.
            </div>
          )}

          {!loading &&
            items?.map((p) => (
              <div key={p.id} className="flex flex-col gap-1 mb-2">
                <img
                  width={300}
                  height={300}
                  src={p.image || FALLBACK}
                  alt={p.nom}
                  loading="lazy"
                  className="w-full h-20 md:h-40 rounded-lg object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = FALLBACK;
                  }}
                />
                <div className="flex items-center justify-between">
                  <p className="text-[11px] leading-tight font-medium truncate max-w-[65%]">
                    {p.nom}
                  </p>
                  <p className="text-[11px] leading-tight text-gray-500">
                    {p.price
                      ? `${Number(p.price).toLocaleString("fr-FR")} Cfa`
                      : "—"}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </aside>
  );
};

export default RightPanel;
