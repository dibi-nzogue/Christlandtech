import React, { useEffect, Suspense, lazy } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ScrollToTopButton from "../components/ScrollToTopButton";
import { forceStartLoading, forceStopLoading } from "../hooks/useFetchQuery";

// 🔹 Sections en lazy
const ServiceIntro = lazy(() => import("../components/ServiceIntro"));
const ServicesBloc = lazy(() => import("../components/ServicesBloc"));
const ServicesExtra = lazy(() => import("../components/ServicesExtra"));
const ContactSection = lazy(() => import("../components/ContactSection"));

const Services: React.FC = () => {
  useEffect(() => {
    // 👉 Force l'affichage du loader dès que la page commence à se monter
    forceStartLoading();

    // 👉 On laisse un petit délai (ex : 800ms) avant de l’éteindre
    const timer = setTimeout(() => {
      forceStopLoading();
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <div>
        <Navbar />

        <Suspense fallback={null}>
          <ServiceIntro />
          <ServicesBloc />
          <ServicesExtra />
          <ContactSection id="contact" />
        </Suspense>

        <Footer />
        <ScrollToTopButton />
      </div>
    </>
  );
};

export default Services;
