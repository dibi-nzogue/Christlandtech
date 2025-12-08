import React, { useEffect } from 'react';
import Navbar from "../components/Navbar";
import Footer from '../components/Footer';
import ScrollToTopButton from "../components/ScrollToTopButton";
import HeroAbout from '../components/HeroAbout';
import ContactSection from '../components/ContactSection';
import BoardManage from '../components/BoardManage';
import StatsSection from '../components/StatsSection';

import GlobalLoader from "../components/GlobalLoader";
import { 
  useGlobalLoading,
  forceStartLoading,
  forceStopLoading
} from "../hooks/useFetchQuery";

const About: React.FC = () => {
  const isLoading = useGlobalLoading();

  useEffect(() => {
    // 👉 Forcer le loader au montage de la page
    forceStartLoading();

    const timer = setTimeout(() => {
      forceStopLoading();
    }, 800);   // tu peux augmenter si tu veux plus long

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {isLoading && <GlobalLoader />}

      <div>
        <Navbar />
        <HeroAbout />
        <BoardManage />
        <StatsSection />
        <ContactSection id="contact" />

        <Footer />
        <ScrollToTopButton />
      </div>
    </>
  );
};

export default About;
