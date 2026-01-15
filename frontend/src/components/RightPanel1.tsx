import React from "react";
import {media, useLatestProducts } from "../hooks/useFetchQuery";

const FALLBACK = "/Dispositivos.webp";

const fmt = (v?: string | null) =>
  v != null ? `${Number(v).toLocaleString("fr-FR")} Cfa` : "—";

const RightPanel1: React.FC = () => {
  const { data: latest, loading } = useLatestProducts();

  const items = (latest ?? []).slice(0, 2);

  return (
    <aside className="w-full lg:w-1/4 mt-6 lg:mt-0 lg:self-start">
      <div className="bg-white p-4 rounded-xl shadow-sm max-h-[65vh] overflow-y-auto">
        <h3 className="font-semibold mb-3">Les Plus Récents</h3>

        {loading && (
          <div className="text-sm text-gray-500">Chargement…</div>
        )}
        {!loading && items.length === 0 && (
          <div className="text-sm text-gray-500">
            Aucun produit pour le moment.
          </div>
        )}

        {!loading &&
          items.map((p) => (
            <div key={p.id} className="flex flex-col gap-3 mb-3">
              <div className="relative w-full overflow-hidden rounded-lg bg-gray-50">
                <div className="pt-[56.25%]" />
                <img
                  width={300}
                  height={300}
                  src={media(p.image) || FALLBACK}
                  loading="lazy"
                  alt={p.nom}
                  className="absolute inset-0 h-full w-full object-contain rounded-xl transition-transform duration-300 ease-out"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = FALLBACK;
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium truncate">{p.nom}</p>
                <p className="text-xs text-gray-500">{fmt(p.price)}</p>
              </div>
            </div>
          ))}
      </div>
    </aside>
  );
};

export default RightPanel1;
