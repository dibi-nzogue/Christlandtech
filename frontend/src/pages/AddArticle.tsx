// src/pages/AddArticle.tsx
import React, { Suspense, lazy } from "react";


// 🔹 Lazy des gros blocs dashboard
const Sidebar = lazy(() => import("../components/Sidebar"));
const Header = lazy(() => import("../components/Header"));
const Banner = lazy(() => import("../components/Banner"));
const ArticleForm = lazy(() => import("../components/ArticleForm"));
const RightPanel2 = lazy(() => import("../components/RightPanel2"));

const AddArticle: React.FC = () => {

  return (
    <Suspense fallback={null}>
      <div className="mx-auto w-full px-6 sm:px-10 lg:px-20 pt-10 bg-[#F4F5F8] h-full md:h-[100vh] overflow-hidden">
        <div className="flex justify-between md:gap-10">
          <div>
            <Sidebar />
          </div>
          <div className="w-full">
            <Header />
            <Banner label="Ajouter un article" />
            <div className="flex flex-col md:flex-row justify-between gap-10 pt-8">
              <ArticleForm />
              <RightPanel2 />
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
};

export default AddArticle;
