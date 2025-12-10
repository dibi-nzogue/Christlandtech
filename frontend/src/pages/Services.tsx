// src/pages/Services.tsx
import React, { useEffect, Suspense, lazy } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ScrollToTopButton from "../components/ScrollToTopButton";
import { forceStartLoading, forceStopLoading } from "../hooks/useFetchQuery";
import { Helmet } from "react-helmet-async"; // 👈 SEO

const ServiceIntro = lazy(() => import("../components/ServiceIntro"));
const ServicesBloc = lazy(() => import("../components/ServicesBloc"));
const ServicesExtra = lazy(() => import("../components/ServicesExtra"));
const ContactSection = lazy(() => import("../components/ContactSection"));

const Services: React.FC = () => {
  useEffect(() => {
    forceStartLoading();
    const timer = setTimeout(() => forceStopLoading(), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      <Helmet>
        <title>Nos Services – Christland Tech</title>
        <meta
          name="description"
          content="Découvrez les services professionnels de Christland Tech : maintenance informatique, installation, conseil, accompagnement et solutions high-tech pour entreprises et particuliers."
        />
      </Helmet>

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
  );
};

export default Services;
