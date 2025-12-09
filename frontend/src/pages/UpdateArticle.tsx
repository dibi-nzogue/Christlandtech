import React, { Suspense, lazy } from "react";

const Sidebar = lazy(() => import("../components/Sidebar"));
const Header = lazy(() => import("../components/Header"));
const Banner = lazy(() => import("../components/Banner"));
const ProductArticle = lazy(() => import("../components/ProductArticle"));
const RightPanel2 = lazy(() => import("../components/RightPanel2"));

const UpdateArticle: React.FC = () => {
  return (
    <Suspense fallback={null}>
      <div className="mx-auto w-full px-6 sm:px-10 lg:px-20 pt-10 bg-[#F4F5F8] min-h-screen overflow-y-auto">
        <div className="flex justify-between md:gap-10">
          <div>
            <Sidebar />
          </div>
          <div className="w-full">
            <Header />
            <Banner label="Modifier un article" />
            <div className="flex flex-col md:flex-row justify-between gap-10 pt-8">
              <ProductArticle />
              <RightPanel2 />
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
};

export default UpdateArticle;
