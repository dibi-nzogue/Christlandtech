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

  // 🔹 SEO sans Helmet (compatible prod)
  React.useEffect(() => {
    // Title
    document.title = "Tous nos produits – Christland Tech";

    // Meta description
    const descContent =
      "Parcourez tous les produits Christland Tech : ordinateurs, téléphones, gaming, électroménager, réseau, accessoires et plus encore. Toutes les catégories réunies sur une seule page.";

    let descTag = document.querySelector(
      'meta[name="description"]'
    ) as HTMLMetaElement | null;

    if (!descTag) {
      descTag = document.createElement("meta");
      descTag.name = "description";
      document.head.appendChild(descTag);
    }
    descTag.content = descContent;

    // (optionnel) meta keywords
    const keywordsContent =
      "christland, christland tech, boutique high-tech, ordinateurs, téléphones, gaming, électroménager, réseau, accessoires, cameroun";

    let keywordsTag = document.querySelector(
      'meta[name="keywords"]'
    ) as HTMLMetaElement | null;

    if (!keywordsTag) {
      keywordsTag = document.createElement("meta");
      keywordsTag.name = "keywords";
      document.head.appendChild(keywordsTag);
    }
    keywordsTag.content = keywordsContent;
  }, []);

  return (
    <>
      <Navbar />
      <main className="pt-1 md:pt-10">
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
