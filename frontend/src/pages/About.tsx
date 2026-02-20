
import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ScrollToTopButton from "../components/ScrollToTopButton";

import HeroAbout from "../components/HeroAbout";
import ContactSection from "../components/ContactSection";
import OrgChart from "../components/OrgChart ";
import StatsSection from "../components/StatsSection";



const About: React.FC = () => {
  
  return (
    <div>
      <Navbar />

      <HeroAbout />
      <OrgChart />
      <StatsSection />
      <ContactSection id="contact" />

      <Footer />
      <ScrollToTopButton />
    </div>
  );
};

export default About;
