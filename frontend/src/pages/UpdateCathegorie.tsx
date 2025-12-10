// src/pages/UpdateCathegorie.tsx
import React from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Banner from "../components/Banner";
import CategoryEditForm from "../components/CategoryEditForm";
import RightPanel1 from "../components/RightPanel1";

const UpdateCathegorie: React.FC = () => {
  return (
   <div className="min-h-screen bg-[#F4F5F8]">
  <div className="flex flex-col md:flex-row h-full mx-auto w-full px-6 sm:px-10 lg:px-20 pt-10 md:gap-10">

        <div className="shrink-0">
          <Sidebar />
        </div>

        <div className="w-full flex flex-col min-h-0">
          <Header />
          <Banner label="Modifier une catégorie" />

          <div className="flex flex-col lg:flex-row flex-1 min-h-0 items-stretch gap-10 pt-8">

          <div className="flex-1 min-h-0">
  <CategoryEditForm />
</div>


            <RightPanel1 />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateCathegorie;
