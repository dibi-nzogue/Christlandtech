import React, { Suspense, lazy } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ScrollToTopButton from "../components/ScrollToTopButton";

// 🔹 Sections lourdes en lazy
const Presentation = lazy(() => import("../components/Presentation"));
const AchatProduit = lazy(() => import("../components/AchatProduit"));
const ContactSection = lazy(() => import("../components/ContactSection"));

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
        <Suspense fallback={null}>
          <Presentation onOrder={handleOrder} />
          <AchatProduit produit={selectedProduct} refEl={achatRef} />
          <ContactSection id="contact" />
        </Suspense>
        <ScrollToTopButton />
        <Footer />
      </main>
    </>
  );
};

export default Produits;
