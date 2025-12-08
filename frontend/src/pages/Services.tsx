import React, { useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ScrollToTopButton from "../components/ScrollToTopButton";
import ServiceIntro from "../components/ServiceIntro";
import ServicesBloc from "../components/ServicesBloc";
import ServicesExtra from "../components/ServicesExtra";
import ContactSection from "../components/ContactSection";

import GlobalLoader from "../components/GlobalLoader";
import { useGlobalLoading, forceStartLoading, forceStopLoading } from "../hooks/useFetchQuery";

const Services: React.FC = () => {
  const isLoading = useGlobalLoading();

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
      {isLoading && <GlobalLoader />}

      <div>
        <Navbar />
        <ServiceIntro />
        <ServicesBloc />
        <ServicesExtra />
        <ContactSection id="contact" />
        <Footer />
        <ScrollToTopButton />
      </div>
    </>
  );
};

export default Services;
