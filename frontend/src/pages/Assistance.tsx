// src/pages/Assistance.tsx
import React, { Suspense, lazy, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ScrollToTopButton from "../components/ScrollToTopButton";
import { forceStartLoading, forceStopLoading } from "../hooks/useFetchQuery";

// 🔹 Sections lourdes en lazy
const AssistanceHero = lazy(() => import("../components/AssistanceHero"));
const PostsSection = lazy(() => import("../components/PostsSection"));
const ContactSection = lazy(() => import("../components/ContactSection"));

const Assistance: React.FC = () => {
  useEffect(() => {
    forceStartLoading();
    const timer = setTimeout(() => {
      forceStopLoading();
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      <Navbar />

      {/* 🔹 Boundary Suspense pour les sections lazies */}
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
