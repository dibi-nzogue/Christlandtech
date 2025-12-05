// src/components/Header.tsx
import React from "react";
import { Search, ShoppingCart, Bell } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const Header: React.FC = () => {
  const [q, setQ] = React.useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // ⏺ Met à jour l'input quand on revient / rafraîchit avec ?q=...
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const initial = params.get("q") || "";
    setQ(initial);
  }, [location.search]);

  // 🔍 Lance la recherche
  const submitSearch = () => {
    const query = q.trim();
    if (!query) {
      // 👇 Si le champ est vide, retour à /Dashboard sans paramètres
      navigate("/dashboard", { replace: true });
      return;
    }
    navigate(`/dashboard?q=${encodeURIComponent(query)}&page=1`, {
      replace: true,
      state: { fromSearch: true },
    });
  };

  // ⚡ Détection automatique : si l’utilisateur vide le champ → retour /Dashboard
  React.useEffect(() => {
    if (q.trim().length === 0) {
      const params = new URLSearchParams(location.search);
      if (params.has("q")) {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [q, navigate, location.search]);

  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 lg:gap-0 pt-8 lg:pt-0">
      <div>
        <h2 className="text-sm text-gray-600">Hi, Franck !</h2>
        <h1 className="text-xl font-bold">Bon retour !</h1>
      </div>

      <div className="flex justify-between items-center gap-5 lg:gap-10 xl:gap-20">
        <div className="relative">
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submitSearch();
              }
            }}
            placeholder="Rechercher (produits, articles)…"
            className="pl-5 pr-10 py-3 rounded-full bg-white shadow-sm focus:outline-none w-full md:w-[500px]"
          />
          <button
            type="button"
            aria-label="Rechercher"
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            onClick={submitSearch}
          >
            <Search />
          </button>
        </div>

        <div className="flex items-center gap-5">
          <ShoppingCart className="text-gray-700 cursor-pointer" />
          <Bell className="text-gray-700 cursor-pointer" />
        </div>
      </div>
    </div>
  );
};

export default Header;
