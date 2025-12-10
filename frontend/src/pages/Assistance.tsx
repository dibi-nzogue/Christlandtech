// src/pages/Assistance.tsx
import React, { Suspense, lazy} from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ScrollToTopButton from "../components/ScrollToTopButton";


const AssistanceHero = lazy(() => import("../components/AssistanceHero"));
const PostsSection = lazy(() => import("../components/PostsSection"));
const ContactSection = lazy(() => import("../components/ContactSection"));

const Assistance: React.FC = () => {

  return (
    <div>
        <title>Assistance – Christland Tech</title>
        <meta
          name="description"
          content="Centre d’assistance Christland Tech : guides, réponses aux questions fréquentes, support technique et accompagnement personnalisé."
        />

      <Navbar />

      <Suspense fallback={null}>
        <AssistanceHero />
        <PostsSection />
        <ContactSection id="contact" />
      </Suspense>

      <Footer />
      <ScrollToTopButton />
    </div>
  );
};

export default Assistance;
