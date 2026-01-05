
import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ScrollToTopButton from "../components/ScrollToTopButton";
import Presentation from "../components/Presentation";
import ContactSection from "../components/ContactSection";
import AchatProduitModal from "../components/AchatProduitModal";

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

  const [showOrderModal, setShowOrderModal] = React.useState(false);

  const handleOrder = (p: ProduitMini) => {
    setSelectedProduct(p);
    setShowOrderModal(true);
  };

  const handleCloseOrderModal = () => {
    setShowOrderModal(false);
    setSelectedProduct(null);
  };

  React.useEffect(() => {
    document.title = "Tous nos produits – Christland Tech";

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

    const canonicalHref = "https://christland.tech/produits";
    let canonicalLink = document.querySelector(
      'link[rel="canonical"]'
    ) as HTMLLinkElement | null;

    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.rel = "canonical";
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonicalHref;
  }, []);

  return (
    <>
      <Navbar />
      <main className="pt-1 md:pt-10">
        <Presentation onOrder={handleOrder} />

        {/* ✅ UN SEUL MODAL */}
        {selectedProduct && (
          <AchatProduitModal
            open={showOrderModal}
            produit={selectedProduct}
            onClose={handleCloseOrderModal}
          />
        )}

        <ContactSection id="contact" />
        <ScrollToTopButton />
        <Footer />
      </main>
    </>
  );
};

export default Produits;
