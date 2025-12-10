// src/pages/About.tsx
import React, {  Suspense, lazy } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ScrollToTopButton from "../components/ScrollToTopButton";



// 🔹 Sections lourdes en lazy
const HeroAbout = lazy(() => import("../components/HeroAbout"));
const ContactSection = lazy(() => import("../components/ContactSection"));
const BoardManage = lazy(() => import("../components/BoardManage"));
const StatsSection = lazy(() => import("../components/StatsSection"));

const About: React.FC = () => {

  return (
    <div>
      {/* 🧠 SEO de la page À propos */}

        <title>À propos – Christland Tech</title>
        <meta
          name="description"
          content="Découvrez Christland Tech : notre mission, nos valeurs et l’équipe qui vous accompagne pour tous vos besoins high-tech au Cameroun."
        />


      <Navbar />

      {/* 🔹 Boundary Suspense pour les sections lazies */}
      <Suspense fallback={null}>
        <HeroAbout />
        <BoardManage />
        <StatsSection />
        <ContactSection id="contact" />
      </Suspense>

      <Footer />
      <ScrollToTopButton />
    </div>
  );
};

export default About;
