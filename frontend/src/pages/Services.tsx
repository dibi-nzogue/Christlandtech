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
      <Navbar />

      <section className="mx-auto w-full max-w-screen-2xl px-6 sm:px-8 lg:px-10 pt-8 md:pt-28 lg:pt-32">
        <HeroCarousel />
      </section>

      {/* ✅ Bloc SEO visible (Google lit ça) */}
      <section className="mx-auto w-full max-w-screen-2xl px-6 sm:px-8 lg:px-10 mt-10">
        <div className="max-w-4xl">
          <h1 className="text-2xl md:text-3xl font-bold">
            Acheter un laptop à Yaoundé et partout au Cameroun
          </h1>

          <p className="mt-4 text-base md:text-lg text-gray-700">
  Vous cherchez où acheter un laptop à Yaoundé ou un ordinateur  ?
  Christland Tech vous propose un large choix d’ordinateurs portables (HP, Dell, Lenovo,
  MacBook), PC de bureau, accessoires et équipements informatiques au meilleur prix au Cameroun.
</p>


          <p className="mt-3 text-base md:text-lg text-gray-700">
            Profitez de produits garantis, d’un service après-vente sérieux et
            d’une livraison rapide à Yaoundé, Douala et partout au Cameroun.
          </p>
        </div>
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
