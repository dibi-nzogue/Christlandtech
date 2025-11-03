// src/components/RightPanel.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useMostDemandedProducts } from "../hooks/useFetchQuery";

const FALLBACK = "/Dispositivos.webp";

const RightPanel: React.FC = () => {
  const navigate = useNavigate();
  const { data: items, loading } = useMostDemandedProducts(2);

  return (
    <div className="space-y-4 w-full md:w-1/4 h-[80vh] md:h-[50vh] lg:h-[65vh]">
      <button onClick={() => navigate('/Dashboard/Ajouter_produit')} className="w-full bg-[#00A9DC] hover:bg-sky-600 text-white py-2 rounded-xl shadow">
        Ajouter un produit
      </button>
      <button onClick={() => navigate('/Dashboard/Ajouter_article')} className="w-full bg-[#00A9DC] hover:bg-sky-600 text-white py-2 rounded-xl shadow">
        Ajouter un article
      </button>

      <div className="bg-white p-4 rounded-xl shadow-sm mt-4">
        <h3 className="font-semibold mb-3">Les Plus Demandés</h3>

        {loading && <div className="text-sm text-gray-500">Chargement…</div>}
        {!loading && (!items || items.length === 0) && (
          <div className="text-sm text-gray-500">Aucune donnée pour le moment.</div>
        )}

        {!loading && items?.map((p) => (
          <div key={p.id} className="flex flex-col gap-3 mb-3">
            <img
              src={p.image || FALLBACK}
              alt={p.nom}
              className="w-[100%] h-24 lg:h-44 rounded-lg object-cover"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK; }}
            />
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium truncate">{p.nom}</p>
              <p className="text-xs text-gray-500">
                {p.price ? `${Number(p.price).toLocaleString("fr-FR")} Cfa` : "—"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RightPanel;
