import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ScrollToTopButton from "../components/ScrollToTopButton";
import ServiceIntro from "../components/ServiceIntro";
import ServicesBloc from "../components/ServicesBloc";
import ServicesExtra from "../components/ServicesExtra";
import ContactSection from "../components/ContactSection";

import GlobalLoader from "../components/GlobalLoader";
import { useGlobalLoading } from "../hooks/useFetchQuery";

const Services: React.FC = () => {
   const isLoading = useGlobalLoading();   // 👈 écoute le loader global
  return (
 <>
      {isLoading && <GlobalLoader />}     {/* 👈 overlay partout tant qu'il y a des fetchs */}

    <div>
      <Navbar />
      <ServiceIntro />
       <ServicesBloc/>
       <ServicesExtra/>
       <ContactSection id="contact"/>
      <Footer />
      <ScrollToTopButton />
    </div>
    </>
  );
};

export default Services;
