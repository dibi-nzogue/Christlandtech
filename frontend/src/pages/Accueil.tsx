import React from "react";
import Navbar from "../components/Navbar";
import HeroCarousel from "../components/HeroCarousel";
// import { useTranslation } from "react-i18next";

const Accueil: React.FC = () => {

  // const { t } = useTranslation();

  return (
    <>
      <Navbar />
      <section className="mx-auto w-full max-w-screen-2xl px-6 sm:px-8 lg:px-10 pt-10 md:pt-20 lg:pt-24">
        <HeroCarousel />
      </section>
    </>
  );
};

export default Accueil;
