// src/pages/Assistance.tsx
import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ScrollToTopButton from "../components/ScrollToTopButton";

import AssistanceHero from "../components/AssistanceHero";
import PostsSection from "../components/PostsSection";
import ContactSection from "../components/ContactSection";

function setMeta(name: string, content: string) {
  let tag = document.querySelector(
    `meta[name="${name}"]`
  ) as HTMLMetaElement | null;

  if (!tag) {
    tag = document.createElement("meta");
    tag.name = name;
    document.head.appendChild(tag);
  }

  tag.content = content;
}

const Assistance: React.FC = () => {
  React.useEffect(() => {
    document.title = "Assistance – Christland Tech";

    setMeta(
      "description",
      "Centre d’assistance Christland Tech : guides, tutoriels, réponses aux questions fréquentes, support technique et accompagnement personnalisé pour vos produits high-tech."
    );
  }, []);

  return (
    <div>
      <Navbar />

      <AssistanceHero />
      <PostsSection />
      <ContactSection id="contact" />

      <Footer />
      <ScrollToTopButton />
    </div>
  );
};

export default Assistance;
