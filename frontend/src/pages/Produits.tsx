// src/pages/Produits.tsx
import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ScrollToTopButton from "../components/ScrollToTopButton";

import Presentation from "../components/Presentation";
import AchatProduit from "../components/AchatProduit";
import ContactSection from "../components/ContactSection";

export type ProduitMini = {
  id: number;
  slug: string;
  nom: string;
  ref?: string;
  image?: string;
};

const Produits: React.FC = () => {
  const [selectedProduct, setSelectedProduct] =
    React.useState<ProduitMini | null>(null);
  const achatRef = React.useRef<HTMLDivElement | null>(null);

  const handleOrder = (p: ProduitMini) => {
    setSelectedProduct(p);
    requestAnimationFrame(() => {
      achatRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <>
      <title>Tous nos produits – Christland Tech</title>
      <meta
        name="description"
        content="Parcourez tous les produits Christland Tech : ordinateurs, téléphones, gaming, électroménager, réseau, accessoires et plus encore. Toutes les catégories réunies sur une seule page."
      />

      <Navbar />
      <main className="pt-1 md:pt-10">
        {/* 👉 plus de Suspense ici */}
        <Presentation onOrder={handleOrder} />
        <AchatProduit produit={selectedProduct} refEl={achatRef} />
        <ContactSection id="contact" />

        <ScrollToTopButton />
        <Footer />
      </main>
    </>
  );
};

export default Produits;
