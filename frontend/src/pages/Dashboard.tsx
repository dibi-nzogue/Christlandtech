import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import StatCard from "../components/StatCard";
import ProductTable from "../components/ProductTable";
import RightPanel from "../components/RightPanel";
import { useDashboardStats } from "../hooks/useFetchQuery";

const Dashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // flash
  const [flash, setFlash] = React.useState<string | null>(() => {
    const s = (location.state as any)?.flash as string | undefined;
    return s ?? null;
  });
  React.useEffect(() => {
    if ((location.state as any)?.flash) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  // 📊 Stats
  const { data: stats, loading: statsLoading, error: statsError } = useDashboardStats();

  const fmt = (n?: number) =>
    typeof n === "number" ? n.toLocaleString("fr-FR") : "—";

  return (
    <div className="mx-auto w-full px-6 sm:px-10 lg:px-20 py-10 bg-[#F4F5F8] h-full md:h-[100vh] overflow-hidden">
      {flash && (
        <div
          role="status"
          className="fixed top-4 right-4 z-[9999] rounded-xl shadow-lg px-4 py-3 text-white bg-emerald-600 flex items-start gap-3"
        >
          <span className="font-semibold">Succès</span>
          <span className="opacity-90">{flash}</span>
          <button
            type="button"
            onClick={() => setFlash(null)}
            className="ml-3 text-white/90 hover:text-white"
            aria-label="Fermer"
          >
            ×
          </button>
        </div>
      )}

      <div className="flex justify-between md:gap-10">
        <div className="md:fixed">
          <Sidebar />
        </div>
        <div className="w-full md:pl-32">
          <Header />

          {/* Cartes KPI */}
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
            <ProductTable />
            <RightPanel />
          </div>

          {statsError && (
            <div className="mt-3 text-sm text-rose-600">
              Erreur stats: {(statsError as any)?.message ?? "inconnue"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
