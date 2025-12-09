// src/pages/Accueil.tsx
import React, { useEffect, Suspense, lazy } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ScrollToTopButton from "../components/ScrollToTopButton";
import { forceStartLoading, forceStopLoading } from "../hooks/useFetchQuery";

// 🔹 Sections lourdes en lazy
const Sponsor = lazy(() => import("../components/Sponsor"));
const HeroCarousel = lazy(() => import("../components/HeroCarousel"));
const ContactSection = lazy(() => import("../components/ContactSection"));
const ServiceSection = lazy(() => import("../components/ServiceSection"));
const CategoriesCarousel = lazy(() => import("../components/CategoriesCarousel"));
const Nouveautes = lazy(() => import("../components/Nouveautes"));

const Accueil: React.FC = () => {
  useEffect(() => {
    forceStartLoading();
    const timer = setTimeout(() => {
      forceStopLoading();
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Navbar />

      {/* Sections lazy chargées dans un Suspense */}
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
