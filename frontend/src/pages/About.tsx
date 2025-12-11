// src/pages/About.tsx
import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ScrollToTopButton from "../components/ScrollToTopButton";

import HeroAbout from "../components/HeroAbout";
import ContactSection from "../components/ContactSection";
import BoardManage from "../components/BoardManage";
import StatsSection from "../components/StatsSection";

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

const About: React.FC = () => {
  React.useEffect(() => {
    document.title = "À propos – Christland Tech";

    setMeta(
      "description",
      "Découvrez Christland Tech : notre mission, nos valeurs et l’équipe qui vous accompagne pour tous vos besoins high-tech au Cameroun. Expertise, conseils et service client de proximité."
    );
  }, []);

  return (
    <div>
      <Navbar />

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
