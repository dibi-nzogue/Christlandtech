import React from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import Banner from '../components/Banner'
import ProductForm from '../components/ProductForm'
import RightPanel1 from '../components/RightPanel1'

const AddProduct: React.FC = () => {
  return (
    <div className="mx-auto w-full px-4 sm:px-6 lg:px-20 pt-6 md:pt-10 bg-[#F4F5F8] min-h-screen">
      <div className="flex gap-6">
        <div>
          <Sidebar />
        </div>

        <div className="w-full flex flex-col">
          <Header />
          <Banner label="Ajouter un produit" />

          {/* 👉 colonne sur mobile / tablette, row seulement à partir de lg */}
          <div className="flex flex-col lg:flex-row gap-8 pt-6">
            <div className="flex-1">
              <ProductForm />
            </div>

            
              <RightPanel1 />
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct