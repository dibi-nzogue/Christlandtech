// src/pages/Services.tsx
import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ScrollToTopButton from "../components/ScrollToTopButton";

import ServiceIntro from "../components/ServiceIntro";
import ServicesBloc from "../components/ServicesBloc";
import ServicesExtra from "../components/ServicesExtra";
import ContactSection from "../components/ContactSection";

const Services: React.FC = () => {
  return (
    <div>
      <title>Nos Services – Christland Tech</title>
      <meta
        name="description"
        content="Découvrez les services professionnels de Christland Tech : maintenance informatique, installation, conseil, accompagnement et solutions high-tech pour entreprises et particuliers."
      />

      <Navbar />

      {/* 👉 plus de Suspense ici */}
      <ServiceIntro />
      <ServicesBloc />
      <ServicesExtra />
      <ContactSection id="contact" />

      <Footer />
      <ScrollToTopButton />
    </div>
  );
};

export default Services;
