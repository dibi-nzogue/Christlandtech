import React from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Banner from "../components/Banner";
import ProductEditForm from "../components/ProductEditForm";
import RightPanel1 from "../components/RightPanel1";

const UpdateProduct: React.FC = () => {
  return (
    <div className="mx-auto w-full px-6 sm:px-10 lg:px-20 pt-10 bg-[#F4F5F8]  overflow-hidden">
      <div className="flex h-full md:gap-10">
        <div className="shrink-0">
          <Sidebar />
        </div>

        {/* Colonne principale = header + contenu */}
        <div className="w-full flex flex-col min-h-0">
          <Header />
          <Banner label="Modifier un produit" />

          {/* Zone scrollable interne (2 colonnes) */}
          <div className="flex flex-1 min-h-0 items-stretch overflow-hidden justify-between gap-10 pt-8">
            {/* Colonne gauche = FORM qui scrolle */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <ProductEditForm />
            </div>

            
              <RightPanel1 />
        
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateProduct;
