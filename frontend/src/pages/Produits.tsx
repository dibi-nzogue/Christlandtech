import React from "react";
import Navbar from "../components/Navbar";
import Presentation from "../components/Presentation";
import AchatProduit from "../components/AchatProduit";
import ContactSection from "../components/ContactSection";
import Footer from "../components/Footer";
import ScrollToTopButton from "../components/ScrollToTopButton";

export type ProduitMini = {
  id: number;
  slug: string;
  nom: string;
  ref?: string;
  image?: string;
};

const Produits: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = React.useState<ProduitMini | null>(null);
  const achatRef = React.useRef<HTMLDivElement | null>(null);

  const handleOrder = (p: ProduitMini) => {
    setSelectedProduct(p);
    // scroll doux vers la section achat
    requestAnimationFrame(() => {
      achatRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <>
      <Navbar />
      <main className="pt-1 md:pt-10">
        <Presentation onOrder={handleOrder} />
        <AchatProduit produit={selectedProduct} refEl={achatRef} />
        <ContactSection id="contact"/>
        <ScrollToTopButton />
        <Footer />
      </main>
    </>
  );
};

export default Produits;
