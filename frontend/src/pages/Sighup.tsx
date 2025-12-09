import React, { Suspense, lazy } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDashboardStats } from "../hooks/useFetchQuery";

// 🔹 lazy des composants dashboard
const Sidebar = lazy(() => import("../components/Sidebar"));
const Header = lazy(() => import("../components/Header"));
const StatCard = lazy(() => import("../components/StatCard"));
const Compte = lazy(() => import("../pages/Compte"));
const TopToast = lazy(() => import("../components/TopToast"));

const Sighup: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Flash message après inscription
  const [flash, setFlash] = React.useState<string | null>(() => {
    const s = (location.state as any)?.flash as string | undefined;
    return s ?? null;
  });

  React.useEffect(() => {
    if ((location.state as any)?.flash) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  // Stats
  const { data: stats, loading: statsLoading, error: statsError } = useDashboardStats();
  const fmt = (n?: number) => (typeof n === "number" ? n.toLocaleString("fr-FR") : "—");

  return (
    <div className="mx-auto w-full px-6 sm:px-10 lg:px-20 py-10 bg-[#F4F5F8] h-full ">
      <Suspense fallback={null}>
        {/* ✅ Popup animé */}
        {flash && (
          <TopToast
            kind="success"
            message={flash}
            onClose={() => setFlash(null)}
          />
        )}

        <div className="flex justify-between md:gap-10">
          <div className="md:fixed">
            <Sidebar />
          </div>
          <div className="w-full md:pl-32">
            <Header />

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4 mt-4">
              <StatCard
                icon="users"
                label="Total Utilisateurs"
                value={statsLoading ? "…" : fmt(stats?.users)}
              />
              <StatCard
                icon="package"
                label="Total Produits (stock)"
                value={statsLoading ? "…" : fmt(stats?.products_stock)}
              />
              <StatCard
                icon="file-text"
                label="Total Articles"
                value={statsLoading ? "…" : fmt(stats?.articles)}
              />
              <StatCard
                icon="message-square"
                label="Total Messages"
                value={statsLoading ? "…" : fmt(stats?.messages)}
              />
            </div>

            <div className="flex flex-col md:flex-row justify-between gap-10 pt-8">
              <Compte />
            </div>

            {statsError && (
              <div className="mt-3 text-sm text-rose-600">
                Erreur stats: {(statsError as any)?.message ?? "inconnue"}
              </div>
            )}
          </div>
        </div>
      </Suspense>
    </div>
  );
};

export default Sighup;
