// src/components/RightPanel1.tsx
import React from "react";
import { useLatestProducts } from "../hooks/useFetchQuery";

const FALLBACK = "/Dispositivos.webp";

const fmt = (v?: string | null) =>
  v != null ? `${Number(v).toLocaleString("fr-FR")} Cfa` : "—";

const RightPanel1: React.FC = () => {
  const { data: latest, loading } = useLatestProducts();

  const items = (latest ?? []).slice(0, 2); // <= ne garder que 2

  return (
    <div className="space-y-4 w-full md:w-1/4 h-[80vh] md:h-[50vh] lg:h-[65vh]">
      <div className="bg-white p-4 rounded-xl shadow-sm mt-4">
        <h3 className="font-semibold mb-3">Les Plus Récents</h3>

        {loading && <div className="text-sm text-gray-500">Chargement…</div>}
        {!loading && items.length === 0 && (
          <div className="text-sm text-gray-500">Aucun produit pour le moment.</div>
        )}

        {!loading &&
          items.map((p) => (
            <div key={p.id} className="flex flex-col gap-3 mb-3">
              <div className="relative w-full overflow-hidden rounded-lg bg-gray-50">
                <div className="pt-[56.25%]" />
                <img
                  src={p.image || FALLBACK}
                  alt={p.name}
                  className="absolute inset-0 h-full w-full  object-cover rounded-xl transition-transform duration-300 ease-out group-hover:scale-[1.02]"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = FALLBACK;
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium truncate">{p.name}</p>
                <p className="text-xs text-gray-500">{fmt(p.price)}</p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default RightPanel1;
