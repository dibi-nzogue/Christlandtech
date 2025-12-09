import React, { Suspense, lazy } from "react";

// 🔹 lazy des composants dashboard
const Sidebar = lazy(() => import("../components/Sidebar"));
const Header = lazy(() => import("../components/Header"));
const Banner = lazy(() => import("../components/Banner"));
const ProductForm = lazy(() => import("../components/ProductForm"));
const RightPanel1 = lazy(() => import("../components/RightPanel1"));

const Update: React.FC = () => {
  return (
    <div className="mx-auto w-full px-6 sm:px-10 lg:px-20 pt-10 bg-[#F4F5F8] h-full md:h-[100vh] overflow-hidden">
      <Suspense fallback={null}>
        <div className="flex justify-between md:gap-10">
          <div>
            <Sidebar />
          </div>
          <div className="w-full">
            <Header />
            <Banner label="Modifier Produit" />
            <div className="flex flex-col md:flex-row justify-between gap-10 pt-8">
              <ProductForm />
              <RightPanel1 />
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
};

export default Update;
