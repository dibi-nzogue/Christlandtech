import React from "react";
import { useLatestArticles } from "../hooks/useFetchQuery";
import type { ApiArticle } from "../hooks/useFetchQuery";
import { Link } from "react-router-dom";

const FALLBACK = "/Dispositivos.webp";

const RightPanel2: React.FC = () => {
  const { data, loading, error } = useLatestArticles(2);

  // ✅ corrige ici : si data est null ou undefined, on met []
  const lastTwo: ApiArticle[] = data ?? [];

  return (
    <div className="space-y-4 w-full md:w-1/4 h-[80vh] md:h-[50vh] lg:h-[65vh]">
      <div className="bg-white p-4 rounded-xl shadow-sm mt-4">
        <h3 className="font-semibold mb-3">Derniers articles</h3>

        {loading && <div className="text-sm text-gray-500">Chargement…</div>}
        {error && (
          <div className="text-sm text-rose-600">Erreur : {String(error)}</div>
        )}
        {!loading && !error && lastTwo.length === 0 && (
          <div className="text-sm text-gray-500">
            Aucun article pour le moment.
          </div>
        )}

        {!loading &&
          !error &&
          lastTwo.map((a) => (
            <Link
              key={a.id}
              to={`/blog/${a.slug}`}
              className="block group mb-4 last:mb-0"
            >
              <div className="relative w-full overflow-hidden rounded-lg bg-gray-50">
                <div className="pt-[56.25%]" />
                <img
                  src={a.image || FALLBACK}
                  alt={a.titre}
                  className="absolute inset-0 h-full w-full object-contain rounded-lg transition-transform duration-300 ease-out group-hover:scale-[1.02]"
                  onError={(e) =>
                    ((e.currentTarget as HTMLImageElement).src = FALLBACK)
                  }
                />
              </div>
              <p className="mt-2 text-sm font-medium line-clamp-1">{a.titre}</p>
              <p className="mt-1 text-xs text-gray-600 line-clamp-2">
                {a.extrait || ""}
              </p>
            </Link>
          ))}
      </div>
    </div>
  );
};

export default RightPanel2;
