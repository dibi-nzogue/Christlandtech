import React from "react";
import Navbar from "../components/Navbar";
import Sponsor from "../components/Sponsor";
import HeroCarousel from "../components/HeroCarousel";
import ContactSection from "../components/ContactSection";
import ServiceSection from "../components/ServiceSection";
import Footer from '../components/Footer';
import ScrollToTopButton from "../components/ScrollToTopButton";
// import { useTranslation } from "react-i18next";

const Accueil: React.FC = () => {

  // const { t } = useTranslation();

  return (
    <>
      <Navbar />
      <section className="mx-auto w-full max-w-screen-2xl px-6 sm:px-8 lg:px-10 pt-8 md:pt-28 lg:pt-32">
        <HeroCarousel />
      </section>
      <Sponsor />
      <ServiceSection />
      <ContactSection />
      <ScrollToTopButton />
      <Footer />
    </>
  );
};

export default Accueil;
