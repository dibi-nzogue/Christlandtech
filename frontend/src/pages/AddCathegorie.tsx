// src/pages/AddCathegorie.tsx
import React, { useEffect, Suspense, lazy } from "react";
import { forceStartLoading, forceStopLoading } from "../hooks/useFetchQuery";

// 🔹 Lazy
const Sidebar = lazy(() => import("../components/Sidebar"));
const Header = lazy(() => import("../components/Header"));
const Banner = lazy(() => import("../components/Banner"));
const CathegorieForm = lazy(() => import("../components/CathegorieForm"));
const RightPanel1 = lazy(() => import("../components/RightPanel1"));

const AddCathegorie: React.FC = () => {
  useEffect(() => {
    forceStartLoading();
    const timer = setTimeout(() => {
      forceStopLoading();
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Suspense fallback={null}>
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-20 pt-6 md:pt-10 bg-[#F4F5F8] min-h-screen">
        <div className="flex gap-6">
          <div>
            <Sidebar />
          </div>
          <div className="w-full flex flex-col">
            <Header />
            <Banner label="Ajouter une catégorie" />
            <div className="flex flex-col lg:flex-row gap-8 pt-6">
              <div className="flex-1">
                <CathegorieForm />
              </div>
              <RightPanel1 />
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
};

export default AddCathegorie;
