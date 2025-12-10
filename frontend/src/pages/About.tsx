// src/pages/About.tsx
import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ScrollToTopButton from "../components/ScrollToTopButton";

import HeroAbout from "../components/HeroAbout";
import ContactSection from "../components/ContactSection";
import BoardManage from "../components/BoardManage";
import StatsSection from "../components/StatsSection";

const About: React.FC = () => {
  return (
    <div>
      <title>À propos – Christland Tech</title>
      <meta
        name="description"
        content="Découvrez Christland Tech : notre mission, nos valeurs et l’équipe qui vous accompagne pour tous vos besoins high-tech au Cameroun."
      />

      <Navbar />

      {/* 👉 plus de Suspense ici */}
      <HeroAbout />
      <BoardManage />
      <StatsSection />
      <ContactSection id="contact" />

      <Footer />
      <ScrollToTopButton />
    </div>
  );
};

export default About;
