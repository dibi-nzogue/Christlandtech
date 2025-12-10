// src/pages/Assistance.tsx
import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ScrollToTopButton from "../components/ScrollToTopButton";

import AssistanceHero from "../components/AssistanceHero";
import PostsSection from "../components/PostsSection";
import ContactSection from "../components/ContactSection";

const Assistance: React.FC = () => {
  return (
    <div>
      <title>Assistance – Christland Tech</title>
      <meta
        name="description"
        content="Centre d’assistance Christland Tech : guides, réponses aux questions fréquentes, support technique et accompagnement personnalisé."
      />

      <Navbar />

      {/* 👉 plus de Suspense ici */}
      <AssistanceHero />
      <PostsSection />
      <ContactSection id="contact" />

      <Footer />
      <ScrollToTopButton />
    </div>
  );
};

export default Assistance;
