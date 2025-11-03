// src/pages/UpdateProduct.tsx
import React from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Banner from "../components/Banner";
import ProductEditForm from "../components/ProductEditForm";
import RightPanel1 from "../components/RightPanel1";

const UpdateProduct: React.FC = () => {
  return (
    <div className="mx-auto w-full px-6 sm:px-10 lg:px-20 pt-10 bg-[#F4F5F8] min-h-screen overflow-y-auto">
      <div className="flex justify-between md:gap-10">
        <div>
          <Sidebar />
        </div>
        <div className="w-full">
          <Header />
          <Banner label="Modifier un produit" />
          <div className="flex flex-col md:flex-row justify-between gap-10 pt-8">
            <ProductEditForm />
            <RightPanel1 />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateProduct;
