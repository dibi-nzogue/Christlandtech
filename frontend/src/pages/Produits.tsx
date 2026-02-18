
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
