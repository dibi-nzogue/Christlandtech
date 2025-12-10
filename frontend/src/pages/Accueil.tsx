// src/pages/Accueil.tsx
import React, { Suspense, lazy } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ScrollToTopButton from "../components/ScrollToTopButton";

// ⬇️ lazy imports
const Sponsor = lazy(() => import("../components/Sponsor"));
const HeroCarousel = lazy(() => import("../components/HeroCarousel"));
const ContactSection = lazy(() => import("../components/ContactSection"));
const ServiceSection = lazy(() => import("../components/ServiceSection"));
const CategoriesCarousel = lazy(() => import("../components/CategoriesCarousel"));
const Nouveautes = lazy(() => import("../components/Nouveautes"));

const Accueil: React.FC = () => {
  return (
    <>
      {/* 🧠 SEO pour la home */}
      <title>Christland Tech – Boutique high-tech au Cameroun</title>
      <meta
        name="description"
        content="Christland Tech est une boutique high-tech au Cameroun spécialisée dans la vente de smartphones, ordinateurs, gaming et accessoires. Livraison rapide à Douala et Yaoundé. Meilleurs prix et produits garantis. Livraison rapide et service client réactif."
      />

      <Navbar />

      {/* ⚠️ IMPORTANT : on NE bloque PAS l'écran complet ici */}
      <Suspense fallback={null}>
        <section className="mx-auto w-full max-w-screen-2xl px-6 sm:px-8 lg:px-10 pt-8 md:pt-28 lg:pt-32">
          <HeroCarousel />
        </section>
        <CategoriesCarousel />
        <Sponsor />
        <Nouveautes />
        <ServiceSection />
        <ContactSection id="contact" />
      </Suspense>

      <ScrollToTopButton />
      <Footer />
    </>
  );
};

export default Accueil;
