import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ScrollToTopButton from "../components/ScrollToTopButton";
import ServiceIntro from "../components/ServiceIntro";
import ServicesBloc from "../components/ServicesBloc";

const Services: React.FC = () => {
  return (
    <div>
      <Navbar />
      <ServiceIntro />
       <ServicesBloc/>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
};

export default Services;
