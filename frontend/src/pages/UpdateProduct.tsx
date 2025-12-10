import React, {  } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Banner from "../components/Banner";
import ProductEditForm from "../components/ProductEditForm";
import RightPanel1 from "../components/RightPanel1";

const UpdateProduct: React.FC = () => {
  

  return (
    <div className="min-h-screen bg-[#F4F5F8]">
      {/* sur mobile: colonne / sur desktop: ligne */}
      <div className="flex flex-col md:flex-row h-full mx-auto w-full px-4 sm:px-6 lg:px-20 pt-6 md:pt-10 md:gap-10">
        {/* Sidebar : sticky seulement à partir de md */}
        <div className="md:shrink-0 md:h-screen md:sticky md:top-0">
          <Sidebar />
        </div>

        {/* Colonne principale = header + contenu */}
        <div className="w-full flex flex-col h-full min-h-0 mt-4 md:mt-0">
          <Header />
          <Banner label="Modifier un produit" />

          {/* Zone scrollable interne */}
          <div className="flex flex-col lg:flex-row flex-1 min-h-0 items-stretch gap-6 pt-6">
            {/* Formulaire : prend toute la largeur sur mobile */}
            <div className="flex-1 min-h-0 h-full">
              <ProductEditForm />
            </div>

            {/* RightPanel1 : en dessous sur mobile, à droite sur grand écran */}
       
              <RightPanel1 />
          
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateProduct;
