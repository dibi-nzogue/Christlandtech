// src/pages/Accueil.tsx
import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ScrollToTopButton from "../components/ScrollToTopButton";

import Sponsor from "../components/Sponsor";
import HeroCarousel from "../components/HeroCarousel";
import ContactSection from "../components/ContactSection";
import ServiceSection from "../components/ServiceSection";
import CategoriesCarousel from "../components/CategoriesCarousel";
import Nouveautes from "../components/Nouveautes";

const Accueil: React.FC = () => {
  return (
    <>
      {/* 🧠 SEO pour la home */}
      <title>Christland Tech – vente de materiel en ligne au Cameroun</title>
      <meta
        name="description"
        content="Christland Tech est une boutique high-tech au Cameroun spécialisée dans la vente de smartphones, ordinateurs, gaming et accessoires. Livraison rapide à Douala et Yaoundé. Meilleurs prix et produits garantis. Livraison rapide et service client réactif."
      />

      <Navbar />

      {/* 👉 plus de Suspense ici */}
      <section className="mx-auto w-full max-w-screen-2xl px-6 sm:px-8 lg:px-10 pt-8 md:pt-28 lg:pt-32">
        <HeroCarousel />
      </section>
      <CategoriesCarousel />
      <Sponsor />
      <Nouveautes />
      <ServiceSection />
      <ContactSection id="contact" />

      <ScrollToTopButton />
      <Footer />
    </>
  );
};

export default Accueil;
