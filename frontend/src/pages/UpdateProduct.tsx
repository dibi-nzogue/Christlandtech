import React, { Suspense, lazy } from "react";

const Sidebar = lazy(() => import("../components/Sidebar"));
const Header = lazy(() => import("../components/Header"));
const Banner = lazy(() => import("../components/Banner"));
const ProductEditForm = lazy(() => import("../components/ProductEditForm"));
const RightPanel1 = lazy(() => import("../components/RightPanel1"));

const UpdateProduct: React.FC = () => {
  return (
    <Suspense fallback={null}>
      <div className="min-h-screen bg-[#F4F5F8]">
        <div className="flex flex-col md:flex-row h-full mx-auto w-full px-4 sm:px-6 lg:px-20 pt-6 md:pt-10 md:gap-10">
          <div className="md:shrink-0 md:h-screen md:sticky md:top-0">
            <Sidebar />
          </div>
          <div className="w-full flex flex-col h-full min-h-0 mt-4 md:mt-0">
            <Header />
            <Banner label="Modifier un produit" />
            <div className="flex flex-col lg:flex-row flex-1 min-h-0 items-stretch gap-6 pt-6">
              <div className="flex-1 min-h-0 h-full">
                <ProductEditForm />
              </div>
              <RightPanel1 />
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
};

export default UpdateProduct;
