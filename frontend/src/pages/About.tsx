import React from 'react'
import Navbar from "../components/Navbar";
import Footer from '../components/Footer';
import ScrollToTopButton from "../components/ScrollToTopButton";
import HeroAbout from '../components/HeroAbout';
import ContactSection from '../components/ContactSection';
import BoardManage from '../components/BoardManage';
import StatsSection from '../components/StatsSection';

import GlobalLoader from "../components/GlobalLoader";
import { useGlobalLoading } from "../hooks/useFetchQuery";

const About: React.FC = () => {
  const isLoading = useGlobalLoading();   // 👈 écoute le loader global

  return (
     <>
      {isLoading && <GlobalLoader />}     {/* 👈 overlay partout tant qu'il y a des fetchs */}
    <div>
        <Navbar />
        <HeroAbout />
        <BoardManage />
        <StatsSection />
        <ContactSection id="contact"/>
        <Footer />
        <ScrollToTopButton />
    </div>
    </>
  )
}

export default About