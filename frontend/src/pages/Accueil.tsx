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

// petit helper local
function setMeta(name: string, content: string) {
  let tag = document.querySelector(
    `meta[name="${name}"]`
  ) as HTMLMetaElement | null;

  if (!tag) {
    tag = document.createElement("meta");
    tag.name = name;
    document.head.appendChild(tag);
  }

  tag.content = content;
}

const Accueil: React.FC = () => {
  React.useEffect(() => {
    // 🔹 Title orienté CTR
    document.title =
      "Christland Tech – Vente de matériel high-tech en ligne au Cameroun";

    // 🔹 Description accrocheuse
    setMeta(
      "description",
      "Achetez vos smartphones, ordinateurs portables, TV, électroménager, gaming et accessoires chez Christland Tech. Meilleurs prix, garantie et livraison rapide à Douala, Yaoundé et partout au Cameroun."
    );

    // 🔹 (optionnel) mots-clés
    setMeta(
      "keywords",
      "christland tech, boutique high tech cameroun, achat smartphone douala, pc portable cameroun, tv ecran plat, gaming cameroun, électroménager yaoundé"
    );
  }, []);

  return (
    <>
      <Navbar />

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
