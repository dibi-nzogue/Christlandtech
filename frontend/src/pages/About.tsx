import React, { useEffect, Suspense, lazy } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ScrollToTopButton from "../components/ScrollToTopButton";
import {
  forceStartLoading,
  forceStopLoading,
} from "../hooks/useFetchQuery";

// 🔹 Sections lourdes en lazy
const HeroAbout = lazy(() => import("../components/HeroAbout"));
const ContactSection = lazy(() => import("../components/ContactSection"));
const BoardManage = lazy(() => import("../components/BoardManage"));
const StatsSection = lazy(() => import("../components/StatsSection"));

const About: React.FC = () => {
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
