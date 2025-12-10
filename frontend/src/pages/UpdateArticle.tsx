import React from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Banner from "../components/Banner";
import ProductArticle from "../components/ProductArticle"; // 👈 le formulaire d’article
import RightPanel2 from "../components/RightPanel2";

const UpdateArticle: React.FC = () => {
  return (
    <div className="mx-auto w-full px-6 sm:px-10 lg:px-20 pt-10 bg-[#F4F5F8] min-h-screen overflow-y-auto">
      <div className="flex justify-between md:gap-10">
        <div>
          <Sidebar />
        </div>
        <div className="w-full">
          <Header />
          <Banner label="Modifier un article" />
          <div className="flex flex-col md:flex-row justify-between gap-10 pt-8">
            <ProductArticle /> {/* 👈 le composant de formulaire */}
            <RightPanel2 />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateArticle;
