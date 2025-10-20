// src/pages/Produits.tsx
import React from "react";
import Navbar from "../components/Navbar";
import Presentation from "../components/Presentation";
import AchatProduit from "../components/AchatProduit";
import ContactSection from "../components/ContactSection";
import Footer from '../components/Footer';
import ScrollToTopButton from "../components/ScrollToTopButton";
const Produits: React.FC = () => {
  return (
    <>
      <Navbar />
      {/* OFFSET pour ne PAS être caché par la navbar fixe */}
      <main className="pt-1 md:pt-10">
        <Presentation />
        <AchatProduit/>
        <ContactSection id="contact"/>
        <ScrollToTopButton />
        <Footer />
      </main>
    </>
  );
};

export default Produits;
